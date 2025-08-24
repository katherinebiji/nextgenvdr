from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db
from models import schemas, models
import crud
import auth
from services.question_processor import question_processor

router = APIRouter()

@router.post("/", response_model=schemas.QuestionResponse)
def create_question(
    question: schemas.QuestionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_question = crud.create_question(db, question, current_user.id)
    
    return schemas.QuestionResponse(
        id=db_question.id,
        title=db_question.title,
        content=db_question.content,
        status=db_question.status,
        priority=db_question.priority,
        tags=json.loads(db_question.tags),
        asked_by=db_question.asker.name,
        asked_at=db_question.asked_at,
        answer=db_question.answer,
        answered_by=db_question.answerer.name if db_question.answerer else None,
        answered_at=db_question.answered_at,
        related_documents=[doc.id for doc in db_question.related_documents]
    )

@router.get("/", response_model=List[schemas.QuestionResponse])
def get_questions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user.role == "buyer" else None
    questions = crud.get_questions(db, skip=skip, limit=limit, status=status, user_id=user_id)
    
    return [
        schemas.QuestionResponse(
            id=q.id,
            title=q.title,
            content=q.content,
            status=q.status,
            priority=q.priority,
            tags=json.loads(q.tags),
            asked_by=q.asker.name,
            asked_at=q.asked_at,
            answer=q.answer,
            answered_by=q.answerer.name if q.answerer else None,
            answered_at=q.answered_at,
            related_documents=[doc.id for doc in q.related_documents]
        )
        for q in questions
    ]

@router.get("/{question_id}", response_model=schemas.QuestionResponse)
def get_question(
    question_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    question = crud.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return schemas.QuestionResponse(
        id=question.id,
        title=question.title,
        content=question.content,
        status=question.status,
        priority=question.priority,
        tags=json.loads(question.tags),
        asked_by=question.asker.name,
        asked_at=question.asked_at,
        answer=question.answer,
        answered_by=question.answerer.name if question.answerer else None,
        answered_at=question.answered_at,
        related_documents=[doc.id for doc in question.related_documents]
    )

@router.put("/{question_id}/answer", response_model=schemas.QuestionResponse)
def answer_question(
    question_id: str,
    answer_data: schemas.QuestionAnswer,
    current_user: models.User = Depends(auth.get_current_seller),
    db: Session = Depends(get_db)
):
    question = crud.answer_question(
        db, question_id, answer_data.answer, current_user.id, answer_data.related_documents
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return schemas.QuestionResponse(
        id=question.id,
        title=question.title,
        content=question.content,
        status=question.status,
        priority=question.priority,
        tags=json.loads(question.tags),
        asked_by=question.asker.name,
        asked_at=question.asked_at,
        answer=question.answer,
        answered_by=question.answerer.name if question.answerer else None,
        answered_at=question.answered_at,
        related_documents=[doc.id for doc in question.related_documents]
    )

@router.put("/{question_id}/status", response_model=schemas.QuestionResponse)
def update_question_status(
    question_id: str,
    status_data: schemas.QuestionStatus,
    current_user: models.User = Depends(auth.get_current_seller),
    db: Session = Depends(get_db)
):
    question = crud.update_question_status(db, question_id, status_data.status)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return schemas.QuestionResponse(
        id=question.id,
        title=question.title,
        content=question.content,
        status=question.status,
        priority=question.priority,
        tags=json.loads(question.tags),
        asked_by=question.asker.name,
        asked_at=question.asked_at,
        answer=question.answer,
        answered_by=question.answerer.name if question.answerer else None,
        answered_at=question.answered_at,
        related_documents=[doc.id for doc in question.related_documents]
    )

@router.post("/upload-text", response_model=List[schemas.QuestionResponse])
def upload_questions_text(
    text_input: schemas.QuestionTextUpload,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Process text input and create questions"""
    if not text_input.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")
    
    # Extract questions from text
    questions = question_processor.extract_questions_from_text(text_input.text)
    
    if not questions:
        raise HTTPException(status_code=400, detail="No valid questions found in the text")
    
    # Create questions in database
    created_questions = question_processor.create_questions_from_upload(
        db, questions, current_user.id
    )
    
    return [
        schemas.QuestionResponse(
            id=q["id"],
            title=q["title"],
            content=q["content"],
            status=q["status"],
            priority=q["priority"],
            tags=json.loads(q["tags"]),
            asked_by=current_user.name,
            asked_at=q["asked_at"],
            answer=None,
            answered_by=None,
            answered_at=None,
            related_documents=[]
        )
        for q in created_questions
    ]

@router.post("/upload-files", response_model=List[schemas.QuestionResponse])
def upload_questions_files(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Process uploaded files and create questions"""
    import logging
    logger = logging.getLogger(__name__)
    all_created_questions = []
    
    for file in files:
        try:
            # Read file content
            file_content = file.file.read()
            file.file.seek(0)  # Reset file pointer
            
            # Extract questions from file
            questions = question_processor.process_file_upload(
                file.filename, file_content, file.content_type
            )
            
            if questions:
                # Create questions in database
                created_questions = question_processor.create_questions_from_upload(
                    db, questions, current_user.id, file.filename
                )
                all_created_questions.extend(created_questions)
        
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {e}")
            continue
    
    if not all_created_questions:
        raise HTTPException(status_code=400, detail="No valid questions found in uploaded files")
    
    return [
        schemas.QuestionResponse(
            id=q["id"],
            title=q["title"],
            content=q["content"],
            status=q["status"],
            priority=q["priority"],
            tags=json.loads(q["tags"]),
            asked_by=current_user.name,
            asked_at=q["asked_at"],
            answer=None,
            answered_by=None,
            answered_at=None,
            related_documents=[]
        )
        for q in all_created_questions
    ]

@router.delete("/{question_id}")
def delete_question(
    question_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Only allow buyers to delete their own questions
    if current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can delete questions")
    
    # Check if the question exists and belongs to the current user
    question = crud.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if question.asked_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own questions")
    
    success = crud.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete question")
    
    return {"message": "Question deleted successfully"}