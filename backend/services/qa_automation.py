"""
Q&A Automation service for automatically answering questions when documents are processed
"""
import openai
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import models
from services.document_processor import DocumentProcessor
from services.agentic_rag import AgenticRAGService
import crud
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class QAAutomationService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.doc_processor = DocumentProcessor()
        self.rag_service = AgenticRAGService()
        
    def process_new_document(self, db: Session, document_id: str):
        """Process a newly uploaded document and auto-answer related questions"""
        try:
            # Get all pending questions
            pending_questions = crud.get_questions(db, status="pending")
            
            if not pending_questions:
                logger.info("No pending questions to process")
                return
            
            # Process each question against the new document
            for question in pending_questions:
                self.try_answer_question(db, question, document_id)
                
        except Exception as e:
            logger.error(f"Error in process_new_document: {e}")
    
    def try_answer_question(self, db: Session, question: models.Question, document_id: str):
        """Try to answer a question using the newly processed document"""
        try:
            # Search for relevant content in the new document
            relevant_docs = self.doc_processor.search_similar_documents(
                query=question.content,
                k=3,
                score_threshold=0.3
            )
            
            # Check if any relevant docs are from the new document
            new_doc_chunks = [doc for doc in relevant_docs if doc.get("document_id") == document_id]
            
            if not new_doc_chunks:
                logger.info(f"New document {document_id} not relevant for question {question.id}")
                return
            
            # Use agentic RAG to generate answer
            rag_response = self.rag_service.answer_question(
                question=question.content,
                context=f"Focus on information related to document ID: {document_id}"
            )
            
            if not rag_response.get("response") or "I don't have information" in rag_response.get("response", ""):
                logger.info(f"No relevant content found for question {question.id}")
                return
            
            # Generate a concise answer with sources
            answer_text = self.generate_concise_answer(question.content, rag_response["response"], new_doc_chunks)
            
            # Auto-answer the question
            crud.answer_question(
                db=db,
                question_id=question.id,
                answer=answer_text,
                user_id=None,  # System-generated answer
                related_documents=[document_id]
            )
            
            logger.info(f"Auto-answered question {question.id} using document {document_id}")
            
        except Exception as e:
            logger.error(f"Error answering question {question.id}: {e}")
    
    def generate_concise_answer(self, question: str, rag_response: str, sources: List[Dict]) -> str:
        """Generate a concise answer with source citations"""
        try:
            # Create source citations
            citations = []
            for i, source in enumerate(sources[:3], 1):  # Limit to top 3 sources
                doc_name = source.get("document_name", "Unknown Document")
                citations.append(f"[{i}] {doc_name}")
            
            citations_text = "\n".join(citations) if citations else ""
            
            # Use AI to create a concise answer
            prompt = f"""Based on the following information, provide a concise, professional answer to the question.

Question: {question}

Information from documents:
{rag_response}

Requirements:
- Keep the answer concise (2-3 sentences maximum)
- Be professional and factual
- Reference source documents using [1], [2], [3] notation
- If information is incomplete, acknowledge it

Answer:"""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.1
            )
            
            answer = response.choices[0].message.content.strip()
            
            # Add source citations at the end
            if citations_text:
                answer += f"\n\nSources:\n{citations_text}"
            
            return answer
            
        except Exception as e:
            logger.error(f"Error generating concise answer: {e}")
            # Fallback to RAG response
            return rag_response[:300] + "..." if len(rag_response) > 300 else rag_response
    
    def batch_process_questions(self, db: Session, question_ids: List[str]) -> Dict[str, Any]:
        """Process multiple questions at once against all available documents"""
        results = {
            "answered": [],
            "no_answer": [],
            "errors": []
        }
        
        try:
            for question_id in question_ids:
                question = crud.get_question(db, question_id)
                if not question:
                    results["errors"].append(f"Question {question_id} not found")
                    continue
                
                if question.status != "pending":
                    results["errors"].append(f"Question {question_id} is not pending")
                    continue
                
                # Try to answer using all available documents
                answer_result = self.try_answer_with_all_docs(db, question)
                
                if answer_result["answered"]:
                    results["answered"].append({
                        "question_id": question_id,
                        "answer": answer_result["answer"],
                        "sources": answer_result["sources"]
                    })
                else:
                    results["no_answer"].append(question_id)
        
        except Exception as e:
            logger.error(f"Error in batch processing: {e}")
            results["errors"].append(str(e))
        
        return results
    
    def try_answer_with_all_docs(self, db: Session, question: models.Question) -> Dict[str, Any]:
        """Try to answer a question using all available processed documents"""
        try:
            # First check if there are relevant documents
            relevant_docs = self.doc_processor.search_similar_documents(
                query=question.content,
                k=5,
                score_threshold=0.3
            )
            
            if not relevant_docs:
                logger.info(f"No relevant documents found for question {question.id}")
                return {"answered": False}
            
            relevant_doc_ids = list(set([doc.get("document_id") for doc in relevant_docs if doc.get("document_id")]))
            
            # Use agentic RAG to answer the question
            rag_response = self.rag_service.answer_question(question.content)
            
            if not rag_response.get("response") or "I don't have information" in rag_response.get("response", ""):
                logger.info(f"RAG could not answer question {question.id}")
                return {"answered": False}
            
            # Generate a shorter, more direct answer
            answer_text = rag_response["response"]
            
            # Update question in database
            updated_question = crud.answer_question(
                db=db,
                question_id=question.id,
                answer=answer_text,
                user_id=None,  # System-generated
                related_documents=relevant_doc_ids
            )
            
            if updated_question:
                logger.info(f"Successfully auto-answered question {question.id}")
                return {
                    "answered": True,
                    "answer": answer_text,
                    "sources": relevant_doc_ids
                }
            else:
                logger.error(f"Failed to update question {question.id} in database")
                return {"answered": False, "error": "Database update failed"}
            
        except Exception as e:
            logger.error(f"Error answering question {question.id}: {e}")
            return {"answered": False, "error": str(e)}

# Global instance
qa_automation_service = QAAutomationService()