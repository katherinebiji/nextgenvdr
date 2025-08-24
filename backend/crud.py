from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import models, schemas
from passlib.context import CryptContext
import json
from typing import List, Optional
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# User operations
def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    import uuid
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        name=user.name,
        role=user.role,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

# Document operations
def get_documents(db: Session, skip: int = 0, limit: int = 100, tags: Optional[List[str]] = None) -> List[models.Document]:
    query = db.query(models.Document)
    if tags:
        for tag in tags:
            query = query.filter(models.Document.tags.contains(tag.lower()))
    return query.offset(skip).limit(limit).all()

def get_document(db: Session, document_id: str) -> Optional[models.Document]:
    return db.query(models.Document).filter(models.Document.id == document_id).first()

def create_document(db: Session, document: schemas.DocumentCreate, user_id: str) -> models.Document:
    import uuid
    db_document = models.Document(
        id=str(uuid.uuid4()),
        name=document.name,
        size=document.size,
        type=document.type,
        content=document.content,
        tags=json.dumps(document.tags),
        uploaded_by_id=user_id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: str, user_id: str) -> bool:
    document = db.query(models.Document).filter(
        and_(models.Document.id == document_id, models.Document.uploaded_by_id == user_id)
    ).first()
    if document:
        db.delete(document)
        db.commit()
        return True
    return False

def delete_document_as_seller(db: Session, document_id: str) -> bool:
    """Delete any document (seller privilege)"""
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if document:
        db.delete(document)
        db.commit()
        return True
    return False

def update_document_summary(db: Session, document_id: str, summary: str) -> Optional[models.Document]:
    document = get_document(db, document_id)
    if document:
        document.summary = summary
        db.commit()
        db.refresh(document)
    return document

# Question operations
def get_questions(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None, user_id: Optional[str] = None) -> List[models.Question]:
    query = db.query(models.Question)
    if status:
        query = query.filter(models.Question.status == status)
    if user_id:
        query = query.filter(models.Question.asked_by_id == user_id)
    return query.order_by(models.Question.asked_at.desc()).offset(skip).limit(limit).all()

def get_question(db: Session, question_id: str) -> Optional[models.Question]:
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def create_question(db: Session, question: schemas.QuestionCreate, user_id: str) -> models.Question:
    import uuid
    db_question = models.Question(
        id=str(uuid.uuid4()),
        title=question.title,
        content=question.content,
        priority=question.priority,
        tags=json.dumps(question.tags),
        asked_by_id=user_id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def answer_question(db: Session, question_id: str, answer: str, user_id: Optional[str], related_documents: List[str]) -> Optional[models.Question]:
    question = get_question(db, question_id)
    if question:
        question.answer = answer
        question.answered_by_id = user_id
        question.answered_at = datetime.utcnow()
        question.status = "answered"
        
        # Clear existing relationships and add new ones
        question.related_documents.clear()
        for doc_id in related_documents:
            document = get_document(db, doc_id)
            if document:
                question.related_documents.append(document)
        
        db.commit()
        db.refresh(question)
    return question

def update_question_status(db: Session, question_id: str, status: str) -> Optional[models.Question]:
    question = get_question(db, question_id)
    if question:
        question.status = status
        db.commit()
        db.refresh(question)
    return question