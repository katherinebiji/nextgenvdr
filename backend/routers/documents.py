from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
import json

from database import get_db
from models import schemas, models
import crud
import auth
from services.document_processor import DocumentProcessor

router = APIRouter()

@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    tags: str = Form(...),
    current_user: models.User = Depends(auth.get_current_seller),
    db: Session = Depends(get_db)
):
    try:
        tags_list = json.loads(tags) if tags else []
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid tags format")
    
    content = await file.read()
    encoded_content = base64.b64encode(content).decode('utf-8')
    
    document_create = schemas.DocumentCreate(
        name=file.filename,
        size=file.size or len(content),
        type=file.content_type or "application/octet-stream",
        content=f"data:{file.content_type or 'application/octet-stream'};base64,{encoded_content}",
        tags=tags_list
    )
    
    db_document = crud.create_document(db, document_create, current_user.id)
    
    # Auto-trigger RAG processing for uploaded document
    try:
        doc_processor = DocumentProcessor()
        processing_result = doc_processor.process_document(
            db_document.content, 
            db_document.name, 
            db_document.id,
            db
        )
        
        # Trigger question auto-answering after document processing
        if processing_result.get("success"):
            from services.qa_automation import qa_automation_service
            qa_automation_service.process_new_document(db, db_document.id)
            
    except Exception as e:
        # Log error but don't fail the upload
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Auto-processing failed for document {db_document.id}: {e}")
    
    return schemas.DocumentResponse(
        id=db_document.id,
        name=db_document.name,
        size=db_document.size,
        type=db_document.type,
        tags=json.loads(db_document.tags),
        uploaded_by=db_document.uploader.name,
        uploaded_at=db_document.uploaded_at,
        summary=db_document.summary
    )

@router.get("/", response_model=List[schemas.DocumentResponse])
def get_documents(
    skip: int = 0,
    limit: int = 100,
    tags: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    tags_list = tags.split(",") if tags else None
    documents = crud.get_documents(db, skip=skip, limit=limit, tags=tags_list)
    
    return [
        schemas.DocumentResponse(
            id=doc.id,
            name=doc.name,
            size=doc.size,
            type=doc.type,
            tags=json.loads(doc.tags),
            uploaded_by=doc.uploader.name,
            uploaded_at=doc.uploaded_at,
            summary=doc.summary
        )
        for doc in documents
    ]

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
def get_document(
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return schemas.DocumentResponse(
        id=document.id,
        name=document.name,
        size=document.size,
        type=document.type,
        tags=json.loads(document.tags),
        uploaded_by=document.uploader.name,
        uploaded_at=document.uploaded_at,
        summary=document.summary
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Sellers can delete any document, others can only delete their own
    if current_user.role == "seller":
        success = crud.delete_document_as_seller(db, document_id)
    else:
        success = crud.delete_document(db, document_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or not authorized")
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"content": document.content}

@router.get("/{document_id}/preview")
def get_document_preview(
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get document content and chunks for preview with highlighting."""
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_processor = DocumentProcessor()
    
    # Get document text content
    document_text = doc_processor.get_document_text(document_id)
    
    # Get all chunks for this document
    chunks = doc_processor.get_document_chunks(document_id)
    
    return {
        "document_id": document_id,
        "document_name": document.name,
        "document_type": document.type,
        "text_content": document_text,
        "chunks": chunks,
        "processing_status": document.processing_status
    }

@router.get("/{document_id}/chunks/{chunk_id}")
def get_document_chunk(
    document_id: str,
    chunk_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific chunk content with position data for highlighting."""
    chunk = db.query(models.DocumentChunk).filter(
        models.DocumentChunk.document_id == document_id,
        models.DocumentChunk.id == chunk_id
    ).first()
    
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")
    
    return {
        "chunk_id": chunk.id,
        "document_id": chunk.document_id,
        "content": chunk.content,
        "chunk_index": chunk.chunk_index,
        "start_position": chunk.start_position,
        "end_position": chunk.end_position,
        "chunk_length": chunk.chunk_length
    }

@router.post("/{document_id}/process")
async def process_document_for_rag(
    document_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Process a document for RAG (extract text, chunk, and embed)."""
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc_processor = DocumentProcessor()
    result = doc_processor.process_document(
        document.content, 
        document.name, 
        document.id,
        db
    )
    
    return {
        "document_id": document_id,
        "processing_result": result,
        "status": "processing_started" if result["success"] else "processing_failed"
    }