#!/usr/bin/env python3

import os
import sys
import uuid
import json
import csv
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add the backend directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import models
import crud

def read_questions_from_csv():
    """Read questions from the CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "mock_data", "MOCK DILIGENCE LIST", "questions.csv")
    questions = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                questions.append({
                    "title": row["Title"],
                    "content": row["Description"],
                    "category": row["Category"],
                    "priority": row["Priority"].lower(),
                    "tag": row["Tag"].lower()
                })
    except FileNotFoundError:
        print(f"CSV file not found at: {csv_path}")
        return []
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []
    
    return questions

def generate_sample_answers():
    """Generate sample answers for some questions"""
    sample_answers = {
        "organizational chart": "Organizational chart uploaded to Corporate folder. 147 total employees across 8 departments. Clear reporting structure with defined roles and responsibilities. No pending organizational changes planned.",
        "governing documents": "All corporate documents uploaded to Legal folder including Articles of Incorporation (Delaware), Bylaws, and Board resolutions. All documents current and properly executed.",
        "board minutes": "Board meeting minutes for past 3 years uploaded. Key decisions include strategic plan approval, major contract authorizations, and executive compensation. All meetings properly documented.",
        "capitalization table": "Current cap table shows 10M shares outstanding. Founder owns 45%, employees 20%, investors 35%. Clean cap structure with no unusual voting arrangements or preferences.",
        "litigation": "No material litigation pending. One minor employment dispute settled for $15K in 2023. Legal review confirms no significant legal risks or contingent liabilities.",
        "financial statements": "Audited financials for 2019-2023 uploaded to Accounting folder. Revenue CAGR of 28%, EBITDA margin improved from 15% to 22%. Clean audit opinions with no material weaknesses.",
        "customer list": "Top 25 customer list by revenue attached. Largest customer represents 8% of revenue. 94% customer retention rate. Strong customer diversity across industries and geographies.",
        "patents": "Company holds 12 patents (8 utility, 4 design) and 5 registered trademarks. All IP wholly owned with no licensing restrictions. Portfolio valued at $2.3M.",
        "employment agreements": "All employment contracts follow standard template. 5 key executives have change-of-control provisions. No unusual severance obligations or employment issues identified.",
        "insurance": "Comprehensive coverage: $10M general liability, $5M cyber, $25M D&O. No material claims in 5 years. All policies current with appropriate coverage levels.",
        "customer contracts": "Material customer agreements uploaded. Standard commercial terms with 24-month average duration. 89% renewal rate. No concerning termination clauses identified.",
        "budgets": "2025 budget projects $28.5M revenue (18% growth) with 25% EBITDA margin. Conservative assumptions with historical 95% forecast accuracy.",
        "security": "SOC 2 Type II compliant with annual penetration testing. Multi-factor authentication implemented. Zero security incidents in past 24 months.",
        "headcount": "Current headcount: 147 employees. Breakdown by department and location provided in HR folder. Planned growth of 25 employees in 2025.",
        "supplier": "Top supplier relationships documented. No single supplier dependency exceeding 15% of COGS. Strong vendor management processes in place."
    }
    return sample_answers

def clear_existing_questions(db: Session):
    """Clear all existing questions from the database"""
    try:
        count = db.query(models.Question).count()
        if count > 0:
            db.query(models.Question).delete()
            db.commit()
            print(f"Cleared {count} existing questions")
    except Exception as e:
        print(f"Error clearing existing questions: {e}")
        db.rollback()

def seed_questions():
    """Add mock questions from CSV to the database with various statuses"""
    
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing questions first
        clear_existing_questions(db)
        # Get existing users (buyer and seller test accounts)
        buyer = crud.get_user_by_email(db, "buyer@test.com")
        seller = crud.get_user_by_email(db, "seller@test.com")
        
        if not buyer or not seller:
            print("Test users not found. Please ensure buyer@test.com and seller@test.com exist.")
            return
        
        # Get some existing documents for relating to questions
        documents = crud.get_documents(db, limit=10)
        doc_ids = [doc.id for doc in documents] if documents else []
        
        # Read questions from CSV
        csv_questions = read_questions_from_csv()
        if not csv_questions:
            print("No questions found in CSV file.")
            return
        
        # Get sample answers
        sample_answers = generate_sample_answers()
        
        # Randomly assign statuses and answers to questions
        statuses = ["pending", "answered", "needs_documents"]
        status_weights = [0.4, 0.5, 0.1]  # 40% pending, 50% answered, 10% needs_documents
        
        # Create questions in database
        created_count = 0
        
        for i, q_data in enumerate(csv_questions):
            # Check if question already exists (by title to avoid duplicates)
            existing = db.query(models.Question).filter(models.Question.title == q_data["title"]).first()
            if existing:
                print(f"Question already exists: {q_data['title']}")
                continue
            
            # Randomly assign status based on weights
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Create tags list from category and tag
            tags = [q_data["tag"]]
            if q_data["category"].lower() not in tags:
                category_tag = q_data["category"].lower().replace(" ", "-").replace(">", "")
                if category_tag and category_tag != q_data["tag"]:
                    tags.append(category_tag)
            
            # Initialize answer data
            answer = None
            answered_by_id = None
            answered_at = None
            related_documents = []
            
            # If status is answered, try to find a relevant answer
            if status == "answered":
                # Look for matching answer by title keywords
                for answer_key, answer_text in sample_answers.items():
                    if any(word in q_data["title"] for word in answer_key.lower().split()):
                        answer = answer_text
                        break
                
                # If no specific answer found, generate a generic response
                if not answer:
                    answer = f"This information has been reviewed and relevant documentation has been uploaded to the {q_data['category'].lower()} folder. Please refer to the attached documents for detailed information."
                
                answered_by_id = seller.id
                answered_at = datetime.utcnow() - timedelta(
                    days=random.randint(0, 7),
                    hours=random.randint(0, 23)
                )
                
                # Randomly assign some related documents
                if doc_ids and random.random() < 0.3:  # 30% chance of having related docs
                    num_docs = random.randint(1, min(3, len(doc_ids)))
                    related_documents = random.sample(doc_ids, num_docs)
            
            # Create the question
            db_question = models.Question(
                id=str(uuid.uuid4()),
                title=q_data["title"],
                content=q_data["content"],
                status=status,
                priority=q_data["priority"],
                tags=json.dumps(tags),
                asked_by_id=buyer.id,
                answer=answer,
                answered_by_id=answered_by_id,
                answered_at=answered_at
            )
            
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            
            # Add related documents if any
            if related_documents:
                for doc_id in related_documents:
                    document = crud.get_document(db, doc_id)
                    if document:
                        db_question.related_documents.append(document)
                db.commit()
            
            created_count += 1
            status_display = f"({status})" if status != "pending" else ""
            print(f"Created question: {q_data['title']} {status_display}")
        
        print(f"\nSuccessfully created {created_count} mock questions from CSV")
        
        # Print summary of questions by status
        pending_count = db.query(models.Question).filter(models.Question.status == "pending").count()
        answered_count = db.query(models.Question).filter(models.Question.status == "answered").count()
        needs_docs_count = db.query(models.Question).filter(models.Question.status == "needs_documents").count()
        
        print(f"Question status summary:")
        print(f"  Pending: {pending_count}")
        print(f"  Answered: {answered_count}")
        print(f"  Needs Documents: {needs_docs_count}")
        
    except Exception as e:
        print(f"Error seeding questions: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_questions()