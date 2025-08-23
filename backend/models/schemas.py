from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str
    name: str

class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    name: str
    size: int
    type: str
    tags: List[str]

class DocumentCreate(DocumentBase):
    content: str

class DocumentResponse(DocumentBase):
    id: str
    uploaded_by: str
    uploaded_at: datetime
    summary: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentUpload(BaseModel):
    tags: List[str]

class QuestionBase(BaseModel):
    title: str
    content: str
    priority: str
    tags: List[str]

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: str
    status: str
    asked_by: str
    asked_at: datetime
    answer: Optional[str] = None
    answered_by: Optional[str] = None
    answered_at: Optional[datetime] = None
    related_documents: List[str] = []

    class Config:
        from_attributes = True

class QuestionAnswer(BaseModel):
    answer: str
    related_documents: List[str]

class QuestionStatus(BaseModel):
    status: str

class DocumentMatch(BaseModel):
    document: DocumentResponse
    score: float
    match_reasons: List[str]

class AIAnalysisRequest(BaseModel):
    document_id: str

class AIAnalysisResponse(BaseModel):
    summary: str
    key_points: List[str]
    suggested_tags: List[str]

class AIDocumentSuggestionRequest(BaseModel):
    question_id: str

class AIAnswerRequest(BaseModel):
    question_id: str
    document_ids: List[str]

class AIAnswerResponse(BaseModel):
    suggested_answer: str
    confidence: float
    sources: List[str]

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None