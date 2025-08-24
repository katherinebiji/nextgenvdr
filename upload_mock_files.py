#!/usr/bin/env python3
"""
Script to upload mock files to the NextGenVDR backend, categorizing them by document type
"""

import os
import requests
import json
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
MOCK_FILES_DIR = "/Users/anthonyshek/Projects/nextgenvdr/mock_data/MOCK FILES"
TEST_USER = {"email": "seller@test.com", "password": "test123"}

# File categorization mapping
FILE_CATEGORIES = {
    # Financial documents -> financial-accounting
    "Audited_Balance_Sheet.xlsx": ["financial-accounting"],
    "Audited_Cash_Flow.xlsx": ["financial-accounting"], 
    "Audited_PnL.xlsx": ["financial-accounting"],
    "Unaudited_Balance_Sheet.xlsx": ["financial-accounting"],
    "Unaudited_Cash_Flow.xlsx": ["financial-accounting"],
    "Unaudited_PnL.xlsx": ["financial-accounting"],
    
    # Legal/Corporate documents -> legal-mgmt
    "Board_Meeting_Minutes_Session_1.pdf": ["legal-mgmt"],
    "Board_Meeting_Minutes_Session_2.pdf": ["legal-mgmt"],
    "Board_Meeting_Minutes_Session_3.pdf": ["legal-mgmt"],
    "Board_Meeting_Minutes_Session_4.pdf": ["legal-mgmt"],
    "Board_Meeting_Minutes_Session_5.pdf": ["legal-mgmt"],
    "Shareholder_Meeting_Minutes_2021.pdf": ["legal-mgmt"],
    "Shareholder_Meeting_Minutes_2022.pdf": ["legal-mgmt"],
    "Shareholder_Meeting_Minutes_2023.pdf": ["legal-mgmt"],
    "Shareholder_Meeting_Minutes_2024.pdf": ["legal-mgmt"],
    "Organizational Chart - AAPL.png": ["legal-corp"],
    
    # Insurance documents -> financial-insurance
    "Insurance_Cyber.pdf": ["financial-insurance"],
    "Insurance_D&O.pdf": ["financial-insurance"],
    "Insurance_General_Liability.pdf": ["financial-insurance"],
    "Insurance_Property.pdf": ["financial-insurance"],
    "Insurance_WorkersComp.pdf": ["financial-insurance"],
    
    # Litigation documents -> legal-legal
    "Litigation_Summary_AliveCor.pdf": ["legal-legal"],
    "Litigation_Summary_EU.pdf": ["legal-legal"],
    "Litigation_Summary_Epic_Games.pdf": ["legal-legal"],
    "Litigation_Summary_Masimo.pdf": ["legal-legal"],
    "Litigation_Summary_Securities.pdf": ["legal-legal"],
    
    # Commercial documents -> commercial-customers and commercial-suppliers
    "Top_25_Customers_AAPL.docx": ["commercial-customers"],
    "Top_15_Suppliers_AAPL.xlsx": ["commercial-suppliers"],
    "Supplier_Onboarding_Policies.docx": ["commercial-policies"],
}

def authenticate():
    """Authenticate with the backend and return access token"""
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
        "name": "Test Seller",
        "role": "seller"
    })
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Authentication failed: {response.status_code} - {response.text}")
        return None

def upload_file(file_path, tags, token):
    """Upload a single file to the backend"""
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'tags': json.dumps(tags)}
        
        response = requests.post(
            f"{BACKEND_URL}/documents/upload",
            files=files,
            data=data,
            headers=headers
        )
    
    return response

def main():
    print("🚀 Starting mock file upload process...")
    
    # Authenticate
    token = authenticate()
    if not token:
        print("❌ Authentication failed")
        return
    
    print("✅ Authentication successful")
    
    # Check if mock files directory exists
    mock_dir = Path(MOCK_FILES_DIR)
    if not mock_dir.exists():
        print(f"❌ Mock files directory not found: {MOCK_FILES_DIR}")
        return
    
    # Get all files in the directory
    mock_files = list(mock_dir.glob("*"))
    print(f"📁 Found {len(mock_files)} files to upload")
    
    success_count = 0
    error_count = 0
    
    # Upload each file
    for file_path in mock_files:
        if file_path.is_file():
            filename = file_path.name
            tags = FILE_CATEGORIES.get(filename, ["general"])
            
            print(f"\n📄 Uploading: {filename}")
            print(f"   📂 Folder: {tags[0]}")
            
            try:
                response = upload_file(file_path, tags, token)
                
                if response.status_code == 200:
                    print(f"   ✅ Success: {filename}")
                    success_count += 1
                else:
                    print(f"   ❌ Failed: {filename} - {response.status_code}: {response.text}")
                    error_count += 1
                    
            except Exception as e:
                print(f"   ❌ Error uploading {filename}: {str(e)}")
                error_count += 1
    
    print(f"\n📊 Upload Summary:")
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {error_count}")
    print(f"   📁 Total: {len(mock_files)}")

if __name__ == "__main__":
    main()