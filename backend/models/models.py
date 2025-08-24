from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

question_documents = Table(
    'question_documents',
    Base.metadata,
    Column('question_id', String, ForeignKey('questions.id'), primary_key=True),
    Column('document_id', String, ForeignKey('documents.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # buyer or seller
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    uploaded_documents = relationship("Document", back_populates="uploader")
    asked_questions = relationship("Question", foreign_keys="[Question.asked_by_id]", back_populates="asker")
    answered_questions = relationship("Question", foreign_keys="[Question.answered_by_id]", back_populates="answerer")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # Base64 encoded
    file_path = Column(String)  # Optional file system path
    tags = Column(Text, nullable=False)  # JSON array as string
    uploaded_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    summary = Column(Text)  # AI-generated summary
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    uploader = relationship("User", back_populates="uploaded_documents")
    related_questions = relationship("Question", secondary=question_documents, back_populates="related_documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    start_position = Column(Integer)  # Character position in original text
    end_position = Column(Integer)    # Character position in original text
    chunk_length = Column(Integer)
    embedding_id = Column(String)     # ChromaDB embedding ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="chunks")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, answered, needs_documents
    priority = Column(String, nullable=False, default="medium")  # low, medium, high
    tags = Column(Text, nullable=False)  # JSON array as string
    answer = Column(Text)
    asked_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    answered_by_id = Column(String, ForeignKey("users.id"))
    asked_at = Column(DateTime(timezone=True), server_default=func.now())
    answered_at = Column(DateTime(timezone=True))
    
    # Relationships
    asker = relationship("User", foreign_keys=[asked_by_id], back_populates="asked_questions")
    answerer = relationship("User", foreign_keys=[answered_by_id], back_populates="answered_questions")
    related_documents = relationship("Document", secondary=question_documents, back_populates="related_questions")