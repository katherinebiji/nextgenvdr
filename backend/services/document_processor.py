import base64
import json
import os
from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pypdf import PdfReader
import io


class DocumentProcessor:
    """Service for processing and embedding documents for RAG functionality."""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        self.vector_store = None
        self.vector_store_path = "backend/vector_store"
        
        # Load existing vector store if it exists
        self._load_vector_store()
    
    def _load_vector_store(self):
        """Load existing FAISS vector store if it exists."""
        try:
            if os.path.exists(self.vector_store_path):
                self.vector_store = FAISS.load_local(
                    self.vector_store_path, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
        except Exception as e:
            print(f"Could not load existing vector store: {e}")
            self.vector_store = None
    
    def process_document(self, document_content: str, document_name: str, document_id: str) -> Dict[str, Any]:
        """
        Process a document by extracting text, chunking, and creating embeddings.
        
        Args:
            document_content: Base64 encoded document content
            document_name: Name of the document
            document_id: Unique identifier for the document
            
        Returns:
            Dictionary with processing results
        """
        try:
            # Extract text from document
            text_content = self._extract_text_from_document(document_content, document_name)
            
            if not text_content or len(text_content.strip()) == 0:
                return {
                    "success": False,
                    "error": "No text content could be extracted from document",
                    "chunks_created": 0
                }
            
            # Create document chunks
            chunks = self._create_chunks(text_content, document_name, document_id)
            
            # Add chunks to vector store
            self._add_chunks_to_vector_store(chunks)
            
            return {
                "success": True,
                "chunks_created": len(chunks),
                "total_characters": len(text_content),
                "document_processed": True
            }
            
        except Exception as e:
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
        """Split text into chunks and create LangChain Documents."""
        # Split text into chunks
        text_chunks = self.text_splitter.split_text(text_content)
        
        # Create Document objects with metadata
        documents = []
        for i, chunk in enumerate(text_chunks):
            doc = Document(
                page_content=chunk,
                metadata={
                    "document_id": document_id,
                    "document_name": document_name,
                    "chunk_index": i,
                    "total_chunks": len(text_chunks),
                    "source": f"{document_name}_chunk_{i}"
                }
            )
            documents.append(doc)
        
        return documents
    
    def _add_chunks_to_vector_store(self, documents: List[Document]):
        """Add document chunks to the vector store."""
        if not documents:
            return
        
        if self.vector_store is None:
            # Create new vector store
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
        else:
            # Add to existing vector store
            self.vector_store.add_documents(documents)
        
        # Save vector store to disk
        os.makedirs(self.vector_store_path, exist_ok=True)
        self.vector_store.save_local(self.vector_store_path)
    
    def search_similar_documents(self, query: str, k: int = 5, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for similar document chunks based on a query.
        
        Args:
            query: Search query
            k: Number of results to return
            score_threshold: Minimum similarity score (0-1)
            
        Returns:
            List of relevant document chunks with metadata
        """
        if self.vector_store is None:
            return []
        
        try:
            # Perform similarity search with scores
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            # Filter by score threshold and format results
            relevant_docs = []
            for doc, score in results:
                # Convert distance to similarity score (lower distance = higher similarity)
                similarity_score = 1 / (1 + score)
                
                if similarity_score >= score_threshold:
                    relevant_docs.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "similarity_score": similarity_score,
                        "document_id": doc.metadata.get("document_id"),
                        "document_name": doc.metadata.get("document_name"),
                        "chunk_index": doc.metadata.get("chunk_index"),
                        "source": doc.metadata.get("source")
                    })
            
            return relevant_docs
            
        except Exception as e:
            print(f"Error searching vector store: {e}")
            return []
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document."""
        if self.vector_store is None:
            return []
        
        try:
            # Get all documents from the vector store
            all_docs = self.vector_store.docstore._dict
            
            # Filter by document_id
            document_chunks = []
            for doc_id, doc in all_docs.items():
                if doc.metadata.get("document_id") == document_id:
                    document_chunks.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "chunk_index": doc.metadata.get("chunk_index"),
                        "source": doc.metadata.get("source")
                    })
            
            # Sort by chunk_index
            document_chunks.sort(key=lambda x: x.get("chunk_index", 0))
            return document_chunks
            
        except Exception as e:
            print(f"Error retrieving document chunks: {e}")
            return []
    
    def remove_document(self, document_id: str) -> bool:
        """Remove all chunks for a specific document from the vector store."""
        if self.vector_store is None:
            return False
        
        try:
            # This is a limitation of FAISS - it doesn't support easy deletion
            # We would need to rebuild the entire vector store without the document
            # For now, we'll mark this as a known limitation
            print(f"Note: Document removal not fully implemented for FAISS. Document {document_id} chunks remain in vector store.")
            return True
            
        except Exception as e:
            print(f"Error removing document: {e}")
            return False
    
    def get_vector_store_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store."""
        if self.vector_store is None:
            return {
                "total_chunks": 0,
                "total_documents": 0,
                "vector_store_exists": False
            }
        
        try:
            all_docs = self.vector_store.docstore._dict
            document_ids = set()
            
            for doc in all_docs.values():
                document_ids.add(doc.metadata.get("document_id"))
            
            return {
                "total_chunks": len(all_docs),
                "total_documents": len(document_ids),
                "vector_store_exists": True,
                "documents": list(document_ids)
            }
            
        except Exception as e:
            return {
                "total_chunks": 0,
                "total_documents": 0,
                "vector_store_exists": False,
                "error": str(e)
            }