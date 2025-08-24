import base64
import json
import os
from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pypdf import PdfReader
import io
from sqlalchemy.orm import Session
from models.models import DocumentChunk, Document as DBDocument
from database import get_db
import uuid
from datetime import datetime


class DocumentProcessor:
    """Service for processing and embedding documents for RAG functionality."""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-ada-002"  # Use ada-002 for 1536 dimensions to match existing collection
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        self.vector_store = None
        self.chroma_db_path = "backend/chroma_db"
        self.collection_name = "vdr_documents"
        
        # Initialize ChromaDB
        self._initialize_chroma_db()
    
    def _initialize_chroma_db(self):
        """Initialize ChromaDB collection."""
        try:
            os.makedirs(self.chroma_db_path, exist_ok=True)
            
            # Initialize Langchain ChromaDB wrapper directly
            self.vector_store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.chroma_db_path
            )
            
            # Access the underlying collection for direct operations
            self.collection = self.vector_store._collection
            
        except Exception as e:
            print(f"Could not initialize ChromaDB: {e}")
            self.vector_store = None
            self.collection = None
    
    def process_document(self, document_content: str, document_name: str, document_id: str, db: Session = None) -> Dict[str, Any]:
        """
        Process a document by extracting text, chunking, and creating embeddings.
        
        Args:
            document_content: Base64 encoded document content
            document_name: Name of the document
            document_id: Unique identifier for the document
            db: Database session for storing chunk metadata
            
        Returns:
            Dictionary with processing results
        """
        try:
            # Update document status to processing
            if db:
                document = db.query(DBDocument).filter(DBDocument.id == document_id).first()
                if document:
                    document.processing_status = "processing"
                    db.commit()
            
            # Extract text from document
            text_content = self._extract_text_from_document(document_content, document_name)
            
            if not text_content or len(text_content.strip()) == 0:
                # Update status to failed
                if db and document:
                    document.processing_status = "failed"
                    db.commit()
                return {
                    "success": False,
                    "error": "No text content could be extracted from document",
                    "chunks_created": 0
                }
            
            # Create document chunks
            chunks = self._create_chunks(text_content, document_name, document_id)
            
            # Add chunks to vector store and database
            chunk_ids = self._add_chunks_to_vector_store(chunks)
            if db:
                self._save_chunks_to_database(chunks, chunk_ids, db)
            
            # Update document status to completed
            if db and document:
                document.processing_status = "completed"
                document.processed_at = datetime.utcnow()
                db.commit()
            
            return {
                "success": True,
                "chunks_created": len(chunks),
                "total_characters": len(text_content),
                "document_processed": True
            }
            
        except Exception as e:
            # Update status to failed
            if db:
                document = db.query(DBDocument).filter(DBDocument.id == document_id).first()
                if document:
                    document.processing_status = "failed"
                    db.commit()
            
            return {
                "success": False,
                "error": f"Error processing document: {str(e)}",
                "chunks_created": 0
            }
    
    def _extract_text_from_document(self, base64_content: str, document_name: str) -> str:
        """Extract text content from various document formats."""
        try:
            # Handle data URL format
            if base64_content.startswith("data:"):
                base64_content = base64_content.split(",")[1]
            
            decoded_bytes = base64.b64decode(base64_content)
            
            # Check file extension for processing method
            file_extension = document_name.lower().split('.')[-1] if '.' in document_name else ''
            
            if file_extension == 'pdf':
                return self._extract_pdf_text(decoded_bytes)
            elif file_extension in ['txt', 'md', 'json', 'csv']:
                return self._extract_text_file(decoded_bytes)
            else:
                # Try to decode as text first
                try:
                    return decoded_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    # If it's a binary file, try PDF extraction as fallback
                    try:
                        return self._extract_pdf_text(decoded_bytes)
                    except:
                        return f"Binary file: {document_name} (size: {len(decoded_bytes)} bytes)"
                        
        except Exception as e:
            raise Exception(f"Could not extract text from document: {str(e)}")
    
    def _extract_pdf_text(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            pdf_reader = PdfReader(pdf_file)
            
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
            
            return text_content.strip()
        except Exception as e:
            raise Exception(f"Could not extract text from PDF: {str(e)}")
    
    def _extract_text_file(self, file_bytes: bytes) -> str:
        """Extract text from text-based files."""
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # Try different encodings
            encodings = ['latin-1', 'cp1252', 'iso-8859-1']
            for encoding in encodings:
                try:
                    return file_bytes.decode(encoding)
                except:
                    continue
            raise Exception("Could not decode text file with any encoding")
    
    def _create_chunks(self, text_content: str, document_name: str, document_id: str) -> List[Document]:
        """Split text into chunks and create LangChain Documents with position tracking."""
        # Split text into chunks
        text_chunks = self.text_splitter.split_text(text_content)
        
        # Create Document objects with metadata including position tracking
        documents = []
        current_position = 0
        
        for i, chunk in enumerate(text_chunks):
            # Find chunk position in original text for highlighting
            chunk_start = text_content.find(chunk, current_position)
            chunk_end = chunk_start + len(chunk) if chunk_start != -1 else current_position + len(chunk)
            
            doc = Document(
                page_content=chunk,
                metadata={
                    "document_id": document_id,
                    "document_name": document_name,
                    "chunk_index": i,
                    "total_chunks": len(text_chunks),
                    "source": f"{document_name}_chunk_{i}",
                    "start_position": chunk_start,
                    "end_position": chunk_end,
                    "chunk_length": len(chunk)
                }
            )
            documents.append(doc)
            current_position = chunk_end
        
        return documents
    
    def _add_chunks_to_vector_store(self, documents: List[Document]) -> List[str]:
        """Add document chunks to the vector store and return chunk IDs."""
        if not documents:
            return []
        
        chunk_ids = []
        
        try:
            if self.vector_store is None:
                # Create new vector store
                self.vector_store = Chroma.from_documents(
                    documents, 
                    self.embeddings,
                    persist_directory=self.chroma_db_path,
                    collection_name=self.collection_name
                )
            else:
                # Add to existing vector store
                chunk_ids = self.vector_store.add_documents(documents)
            
            # If chunk_ids weren't returned, generate them
            if not chunk_ids:
                chunk_ids = [str(uuid.uuid4()) for _ in documents]
            
            # ChromaDB persists automatically, but we can explicitly persist
            if hasattr(self.vector_store, 'persist'):
                self.vector_store.persist()
                
            return chunk_ids
            
        except Exception as e:
            print(f"Error adding chunks to vector store: {e}")
            return []
    
    def _save_chunks_to_database(self, documents: List[Document], chunk_ids: List[str], db: Session):
        """Save chunk metadata to database for position tracking."""
        try:
            for i, (doc, chunk_id) in enumerate(zip(documents, chunk_ids)):
                chunk = DocumentChunk(
                    id=chunk_id if chunk_id else str(uuid.uuid4()),
                    document_id=doc.metadata["document_id"],
                    chunk_index=doc.metadata["chunk_index"],
                    content=doc.page_content,
                    start_position=doc.metadata.get("start_position"),
                    end_position=doc.metadata.get("end_position"),
                    chunk_length=doc.metadata.get("chunk_length"),
                    embedding_id=chunk_id
                )
                db.add(chunk)
            
            db.commit()
            
        except Exception as e:
            print(f"Error saving chunks to database: {e}")
            db.rollback()
    
    def search_similar_documents(self, query: str, k: int = 5, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for similar document chunks based on a query.
        
        Args:
            query: Search query
            k: Number of results to return
            score_threshold: Minimum similarity score (0-1)
            
        Returns:
            List of relevant document chunks with metadata including position data
        """
        if self.vector_store is None:
            return []
        
        try:
            # Perform similarity search with scores
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            # Filter by score threshold and format results
            relevant_docs = []
            for doc, score in results:
                # ChromaDB uses L2 distance, convert to similarity score (higher is better)
                # For L2 distance, smaller values mean more similar
                similarity_score = 1 / (1 + score)  # Convert distance to similarity (0-1 range)
                
                if similarity_score >= score_threshold:
                    relevant_docs.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "similarity_score": similarity_score,
                        "document_id": doc.metadata.get("document_id"),
                        "document_name": doc.metadata.get("document_name"),
                        "chunk_index": doc.metadata.get("chunk_index"),
                        "source": doc.metadata.get("source"),
                        "start_position": doc.metadata.get("start_position"),
                        "end_position": doc.metadata.get("end_position"),
                        "chunk_length": doc.metadata.get("chunk_length")
                    })
            
            return relevant_docs
            
        except Exception as e:
            print(f"Error searching vector store: {e}")
            return []
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document."""
        if self.collection is None:
            return []
        
        try:
            # Query ChromaDB collection for specific document
            results = self.collection.get(
                where={"document_id": document_id},
                include=["documents", "metadatas"]
            )
            
            # Format results
            document_chunks = []
            for i in range(len(results["documents"])):
                metadata = results["metadatas"][i]
                document_chunks.append({
                    "content": results["documents"][i],
                    "metadata": metadata,
                    "chunk_index": metadata.get("chunk_index"),
                    "source": metadata.get("source"),
                    "start_position": metadata.get("start_position"),
                    "end_position": metadata.get("end_position"),
                    "chunk_length": metadata.get("chunk_length")
                })
            
            # Sort by chunk_index
            document_chunks.sort(key=lambda x: x.get("chunk_index", 0))
            return document_chunks
            
        except Exception as e:
            print(f"Error retrieving document chunks: {e}")
            return []
    
    def remove_document(self, document_id: str) -> bool:
        """Remove all chunks for a specific document from the vector store."""
        if self.collection is None:
            return False
        
        try:
            # ChromaDB supports deletion by metadata filter
            self.collection.delete(
                where={"document_id": document_id}
            )
            print(f"Successfully removed document {document_id} from vector store.")
            return True
            
        except Exception as e:
            print(f"Error removing document: {e}")
            return False
    
    def get_vector_store_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store."""
        if self.collection is None:
            return {
                "total_chunks": 0,
                "total_documents": 0,
                "vector_store_exists": False
            }
        
        try:
            # Get collection info
            collection_count = self.collection.count()
            
            # Get all metadata to count unique documents
            all_data = self.collection.get(include=["metadatas"])
            document_ids = set()
            
            for metadata in all_data["metadatas"]:
                document_ids.add(metadata.get("document_id"))
            
            return {
                "total_chunks": collection_count,
                "total_documents": len(document_ids),
                "vector_store_exists": True,
                "documents": list(document_ids),
                "collection_name": self.collection_name
            }
            
        except Exception as e:
            return {
                "total_chunks": 0,
                "total_documents": 0,
                "vector_store_exists": False,
                "error": str(e)
            }
    
    def get_document_text(self, document_id: str) -> Optional[str]:
        """Get the full text content of a document by reconstructing from chunks."""
        chunks = self.get_document_chunks(document_id)
        if not chunks:
            return None
        
        # Sort chunks by index and concatenate
        sorted_chunks = sorted(chunks, key=lambda x: x.get("chunk_index", 0))
        return "\n".join([chunk["content"] for chunk in sorted_chunks])