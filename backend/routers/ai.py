from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from database import get_db
from models import schemas, models
from services.openai_service import OpenAIService
from services.agentic_rag import AgenticRAGService
from services.document_processor import DocumentProcessor
import crud
import auth

router = APIRouter()
openai_service = OpenAIService()
rag_service = AgenticRAGService()
doc_processor = DocumentProcessor()

@router.post("/analyze-document", response_model=schemas.AIAnalysisResponse)
def analyze_document(
    request: schemas.AIAnalysisRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    analysis = openai_service.analyze_document(document.content, document.name)
    
    # Update document with AI-generated summary
    crud.update_document_summary(db, document.id, analysis["summary"])
    
    return schemas.AIAnalysisResponse(
        summary=analysis["summary"],
        key_points=analysis["key_points"],
        suggested_tags=analysis["suggested_tags"]
    )

@router.post("/suggest-documents", response_model=List[schemas.DocumentMatch])
def suggest_documents(
    request: schemas.AIDocumentSuggestionRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    question = crud.get_question(db, request.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    documents = crud.get_documents(db, limit=50)
    
    # Prepare documents for AI analysis
    doc_data = [
        {
            "id": doc.id,
            "name": doc.name,
            "tags": json.loads(doc.tags)
        }
        for doc in documents
    ]
    
    matches = openai_service.find_relevant_documents(
        question.title, 
        question.content, 
        doc_data
    )
    
    # Convert to response format
    result = []
    for match in matches:
        doc = crud.get_document(db, match["document_id"])
        if doc:
            result.append(schemas.DocumentMatch(
                document=schemas.DocumentResponse(
                    id=doc.id,
                    name=doc.name,
                    size=doc.size,
                    type=doc.type,
                    tags=json.loads(doc.tags),
                    uploaded_by=doc.uploader.name,
                    uploaded_at=doc.uploaded_at,
                    summary=doc.summary
                ),
                score=match["score"],
                match_reasons=match["reasons"]
            ))
    
    return result

@router.post("/generate-answer", response_model=schemas.AIAnswerResponse)
def generate_answer(
    request: schemas.AIAnswerRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    question = crud.get_question(db, request.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get document contents
    document_contents = []
    valid_doc_ids = []
    
    for doc_id in request.document_ids:
        document = crud.get_document(db, doc_id)
        if document:
            content_text = openai_service._extract_text_from_base64(document.content)
            document_contents.append(f"Document: {document.name}\n{content_text}")
            valid_doc_ids.append(doc_id)
    
    if not document_contents:
        raise HTTPException(status_code=400, detail="No valid documents found")
    
    answer_data = openai_service.generate_answer(
        question.title,
        question.content,
        document_contents
    )
    
    return schemas.AIAnswerResponse(
        suggested_answer=answer_data["suggested_answer"],
        confidence=answer_data["confidence"],
        sources=valid_doc_ids
    )

@router.post("/extract-tags", response_model=List[str])
def extract_tags(
    request: schemas.AIAnalysisRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    tags = openai_service.extract_tags(document.content, document.name)
    return tags

# === RAG-POWERED ENDPOINTS ===

@router.post("/process-document-for-rag")
def process_document_for_rag(
    request: schemas.AIAnalysisRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Process a document for RAG by creating embeddings and storing in vector database."""
    document = crud.get_document(db, request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Process document for RAG
    result = doc_processor.process_document(
        document_content=document.content,
        document_name=document.name,
        document_id=document.id,
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to process document"))
    
    return {
        "message": "Document processed successfully for RAG",
        "chunks_created": result["chunks_created"],
        "document_id": document.id,
        "document_name": document.name,
        "total_characters": result.get("total_characters", 0)
    }

@router.post("/rag-answer-question")
def rag_answer_question(
    request: Dict[str, Any],
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Answer a predefined question using agentic RAG."""
    question_id = request.get("question_id")
    if not question_id:
        raise HTTPException(status_code=400, detail="question_id is required")
        
    question = crud.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Prepare question data
    question_data = {
        "title": question.title,
        "content": question.content,
        "priority": question.priority
    }
    
    # Use agentic RAG to answer
    result = rag_service.answer_predefined_question(question_data)
    
    return {
        "question_id": question_id,
        "suggested_answer": result["suggested_answer"],
        "confidence": result["confidence"],
        "sources": result["sources"],
        "agent_used_retrieval": result["agent_used_retrieval"],
        "success": result["success"]
    }

@router.post("/rag-chat")
def rag_chat(
    request: Dict[str, Any],
    current_user: models.User = Depends(auth.get_current_user)
):
    """Interactive chat with RAG-powered responses."""
    message = request.get("message", "")
    chat_history = request.get("chat_history", [])
    
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Use agentic RAG for chat
    result = rag_service.chat_with_documents(
        message=message,
        chat_history=chat_history
    )
    
    # Get detailed source information if documents were used
    detailed_sources = []
    used_documents = result.get("agent_used_retrieval", False)
    
    # If the agent used retrieval, get the actual source documents
    if used_documents:
        similar_docs = doc_processor.search_similar_documents(
            query=message,
            k=5,
            score_threshold=0.2
        )
        
        # Convert to detailed source format
        for doc in similar_docs:
            detailed_sources.append({
                "document_id": doc["document_id"],
                "document_name": doc["document_name"],
                "chunk_index": doc["chunk_index"],
                "start_position": doc.get("start_position", 0),
                "end_position": doc.get("end_position", 0),
                "content": doc["content"],
                "similarity_score": doc["similarity_score"]
            })
    
    return {
        "response": result["response"],
        "used_documents": used_documents,
        "sources": detailed_sources,
        "success": result["success"],
        "message_type": result["message_type"]
    }

@router.post("/rag-answer-with-documents")
def rag_answer_with_documents(
    question_id: str,
    document_ids: List[str],
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Answer a question using RAG with focus on specific documents."""
    question = crud.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Verify documents exist
    valid_doc_ids = []
    for doc_id in document_ids:
        if crud.get_document(db, doc_id):
            valid_doc_ids.append(doc_id)
    
    if not valid_doc_ids:
        raise HTTPException(status_code=400, detail="No valid documents found")
    
    # Prepare question data
    question_data = {
        "title": question.title,
        "content": question.content,
        "priority": question.priority
    }
    
    # Use agentic RAG with specific documents
    result = rag_service.answer_predefined_question(
        question_data=question_data,
        relevant_document_ids=valid_doc_ids
    )
    
    return {
        "question_id": question_id,
        "document_ids_used": valid_doc_ids,
        "suggested_answer": result["suggested_answer"],
        "confidence": result["confidence"],
        "sources": result["sources"],
        "agent_used_retrieval": result["agent_used_retrieval"],
        "success": result["success"]
    }

@router.get("/rag-search")
def rag_search(
    query: str,
    k: int = 5,
    score_threshold: float = 0.7,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Search documents using RAG vector similarity."""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    results = doc_processor.search_similar_documents(
        query=query,
        k=k,
        score_threshold=score_threshold
    )
    
    return {
        "query": query,
        "results": results,
        "total_found": len(results)
    }

@router.get("/rag-status")
def rag_status(current_user: models.User = Depends(auth.get_current_user)):
    """Get status of the RAG system."""
    return rag_service.get_system_status()

@router.post("/bulk-process-documents-for-rag")
def bulk_process_documents_for_rag(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Process all documents in the database for RAG."""
    documents = crud.get_documents(db, limit=1000)  # Get all documents
    
    results = []
    successful = 0
    failed = 0
    
    for document in documents:
        try:
            result = doc_processor.process_document(
                document_content=document.content,
                document_name=document.name,
                document_id=document.id,
                db=db
            )
            
            if result["success"]:
                successful += 1
                results.append({
                    "document_id": document.id,
                    "document_name": document.name,
                    "status": "success",
                    "chunks_created": result["chunks_created"]
                })
            else:
                failed += 1
                results.append({
                    "document_id": document.id,
                    "document_name": document.name,
                    "status": "failed",
                    "error": result.get("error", "Unknown error")
                })
                
        except Exception as e:
            failed += 1
            results.append({
                "document_id": document.id,
                "document_name": document.name,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "total_processed": len(documents),
        "successful": successful,
        "failed": failed,
        "results": results
    }

@router.post("/batch-answer-questions")
def batch_answer_questions(
    request: Dict[str, Any],
    current_user: models.User = Depends(auth.get_current_seller),
    db: Session = Depends(get_db)
):
    """Batch process questions to auto-answer using available documents"""
    from services.qa_automation import qa_automation_service
    
    question_ids = request.get("question_ids", [])
    if not question_ids:
        # Process all pending questions if none specified
        pending_questions = crud.get_questions(db, status="pending")
        question_ids = [q.id for q in pending_questions]
    
    if not question_ids:
        return {
            "message": "No pending questions to process",
            "results": {
                "answered": [],
                "no_answer": [],
                "errors": []
            }
        }
    
    results = qa_automation_service.batch_process_questions(db, question_ids)
    
    return {
        "message": f"Processed {len(question_ids)} questions",
        "results": results
    }

@router.post("/auto-answer-question/{question_id}")
def auto_answer_single_question(
    question_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-answer a single question using RAG"""
    question = crud.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if question.status != "pending":
        return {"message": "Question is not pending", "status": question.status}
    
    try:
        # Use agentic RAG to answer
        rag_response = rag_service.answer_question(question.content)
        
        if not rag_response.get("answer") or not rag_response.get("success"):
            return {"message": "Could not generate answer", "error": "No answer from RAG"}
        
        # Find relevant documents
        relevant_docs = doc_processor.search_similar_documents(
            query=question.content,
            k=3,
            score_threshold=0.3
        )
        
        relevant_doc_ids = [doc.get("document_id") for doc in relevant_docs if doc.get("document_id")]
        
        # Update question with answer
        updated_question = crud.answer_question(
            db=db,
            question_id=question_id,
            answer=rag_response["answer"],
            user_id=None,  # System-generated
            related_documents=relevant_doc_ids[:3]  # Limit to top 3
        )
        
        if updated_question:
            return {
                "message": "Question answered successfully", 
                "answer": rag_response["answer"],
                "sources": relevant_doc_ids[:3],
                "status": updated_question.status
            }
        else:
            return {"message": "Failed to update question", "error": "Database update failed"}
            
    except Exception as e:
        logger.error(f"Error auto-answering question {question_id}: {e}")
        return {"message": "Error processing question", "error": str(e)}