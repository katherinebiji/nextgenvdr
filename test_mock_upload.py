#!/usr/bin/env python3
"""
Test script to upload mock documents and verify the RAG system works.
This script demonstrates the complete workflow:
1. Upload documents from mock_data/MOCK FILES/
2. Process them for RAG
3. Test Q&A functionality
"""

import requests
import base64
import os
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"
MOCK_FILES_DIR = "/Users/anthonyshek/Projects/nextgenvdr/mock_data/MOCK FILES"

def login():
    """Login with test seller account."""
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "test@test.com",
        "password": "test123"
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def upload_document(token, file_path, tags):
    """Upload a document to the backend."""
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f)}
        data = {"tags": json.dumps(tags)}
        
        response = requests.post(
            f"{BASE_URL}/documents/upload",
            headers=headers,
            files=files,
            data=data
        )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Upload failed for {file_path}: {response.text}")
        return None

def process_document_for_rag(token, document_id):
    """Process a document for RAG."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(
        f"{BASE_URL}/ai/process-document-for-rag",
        headers=headers,
        json={"document_id": document_id}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"RAG processing failed for {document_id}: {response.text}")
        return None

def test_rag_chat(token, message):
    """Test RAG chat functionality."""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(
        f"{BASE_URL}/ai/rag-chat",
        headers=headers,
        json={
            "message": message,
            "chat_history": []
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"RAG chat failed: {response.text}")
        return None

def main():
    print("🚀 Testing NextGenVDR Document Upload and RAG System")
    print("=" * 60)
    
    # Step 1: Login
    print("1. Logging in...")
    token = login()
    if not token:
        print("❌ Login failed. Make sure the backend is running.")
        return
    print("✅ Login successful")
    
    # Step 2: Upload a few test documents
    print("\n2. Uploading test documents...")
    test_files = [
        ("Audited_Balance_Sheet.xlsx", ["financial", "accounting"]),
        ("Board_Meeting_Minutes_Session_1.pdf", ["legal", "governance"]),
        ("Insurance_Cyber.pdf", ["legal", "insurance"])
    ]
    
    uploaded_docs = []
    for filename, tags in test_files:
        file_path = os.path.join(MOCK_FILES_DIR, filename)
        if os.path.exists(file_path):
            print(f"   Uploading {filename}...")
            result = upload_document(token, file_path, tags)
            if result:
                uploaded_docs.append(result)
                print(f"   ✅ {filename} uploaded (ID: {result['id']})")
            else:
                print(f"   ❌ {filename} failed to upload")
        else:
            print(f"   ⚠️  {filename} not found at {file_path}")
    
    if not uploaded_docs:
        print("❌ No documents uploaded successfully")
        return
    
    # Step 3: Process documents for RAG
    print(f"\n3. Processing {len(uploaded_docs)} documents for RAG...")
    for doc in uploaded_docs:
        print(f"   Processing {doc['name']}...")
        result = process_document_for_rag(token, doc['id'])
        if result:
            print(f"   ✅ {doc['name']} processed - {result.get('chunks_created', 0)} chunks created")
        else:
            print(f"   ❌ {doc['name']} processing failed")
    
    # Step 4: Test RAG Chat
    print("\n4. Testing RAG Chat...")
    test_questions = [
        "What is the company's cash position?",
        "What insurance policies does the company have?",
        "What were the key decisions from the last board meeting?"
    ]
    
    for question in test_questions:
        print(f"\n   Q: {question}")
        result = test_rag_chat(token, question)
        if result and result.get("success"):
            print(f"   A: {result['response'][:100]}...")
            if result.get("used_documents"):
                print(f"   📄 Used {len(result.get('sources', []))} source documents")
            else:
                print("   💭 Answered from general knowledge")
        else:
            print("   ❌ Chat failed")
    
    print(f"\n🎉 Test completed! Uploaded {len(uploaded_docs)} documents and tested RAG chat.")
    print("\nNext steps:")
    print("- Open the frontend at http://localhost:3000")
    print("- Login with seller@test.com / test123")
    print("- Test the chatbot and document preview features")

if __name__ == "__main__":
    main()