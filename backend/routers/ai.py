from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from models import schemas, models
from services.openai_service import OpenAIService
import crud
import auth

router = APIRouter()
openai_service = OpenAIService()

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