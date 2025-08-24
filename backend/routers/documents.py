from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
import json

from database import get_db
from models import schemas, models
import crud
import auth

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
    current_user: models.User = Depends(auth.get_current_seller),
    db: Session = Depends(get_db)
):
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