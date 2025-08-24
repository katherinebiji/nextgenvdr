import requests
import json

# Login as buyer
login_data = {
    "email": "buyer@test.com",
    "password": "test123",
    "name": "John Doe",
    "role": "buyer"
}

# Login to get token
response = requests.post("http://localhost:8000/auth/login", json=login_data)
print(f"Login response: {response.status_code}")
if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"Got token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create some test questions
    questions = [
        {
            "title": "Revenue Information",
            "content": "What is the company's current annual revenue?",
            "priority": "high",
            "tags": ["financial", "revenue"]
        },
        {
            "title": "Risk Assessment", 
            "content": "What are the main risk factors for this acquisition?",
            "priority": "medium",
            "tags": ["risk", "legal"]
        },
        {
            "title": "Financial Statements",
            "content": "Can you provide the latest audited financial statements?",
            "priority": "high", 
            "tags": ["financial", "audit"]
        }
    ]
    
    for question in questions:
        response = requests.post("http://localhost:8000/questions/", json=question, headers=headers)
        print(f"Created question '{question['title']}': {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
    
    # Get questions to verify
    response = requests.get("http://localhost:8000/questions/", headers=headers)
    print(f"Get questions response: {response.status_code}")
    if response.status_code == 200:
        questions = response.json()
        print(f"Found {len(questions)} questions:")
        for q in questions:
            print(f"  - {q['id']}: {q['content']}")
else:
    print(f"Login failed: {response.text}")