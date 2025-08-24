#!/usr/bin/env python3

import requests
import json

# Test the document preview API endpoint
def test_document_preview():
    base_url = "http://localhost:8000"
    
    # First, login to get auth token
    print("Logging in...")
    try:
        login_response = requests.post(f"{base_url}/auth/login", json={
            "email": "buyer@test.com",
            "password": "test123",
            "name": "Test Buyer", 
            "role": "buyer"
        })
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return False
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check what documents exist
        print("Checking available documents...")
        response = requests.get(f"{base_url}/documents/", headers=headers)
        if response.status_code == 200:
            documents = response.json()
            print(f"Found {len(documents)} documents")
            
            if documents:
                # Find a text document for better testing
                text_doc = None
                for doc in documents:
                    if doc["name"].endswith(('.txt', '.md', '.json')):
                        text_doc = doc
                        break
                
                # Use first document if no text document found
                test_doc = text_doc if text_doc else documents[0]
                doc_id = test_doc["id"]
                doc_name = test_doc["name"]
                print(f"Testing preview for document: {doc_name} (ID: {doc_id})")
                
                preview_response = requests.get(f"{base_url}/documents/{doc_id}/preview", headers=headers)
                
                if preview_response.status_code == 200:
                    preview_data = preview_response.json()
                    print("✅ Document preview endpoint working!")
                    print(f"Document: {preview_data.get('document_name')}")
                    print(f"Type: {preview_data.get('document_type')}")
                    print(f"Processing Status: {preview_data.get('processing_status')}")
                    print(f"Text Content Length: {len(preview_data.get('text_content', ''))}")
                    print(f"Number of Chunks: {len(preview_data.get('chunks', []))}")
                    
                    if preview_data.get('text_content'):
                        print(f"Text preview: {preview_data['text_content'][:200]}...")
                    
                    return True
                else:
                    print(f"❌ Preview failed with status {preview_response.status_code}: {preview_response.text}")
                    return False
            else:
                print("❌ No documents found")
                return False
        else:
            print(f"❌ Failed to get documents: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_document_preview()