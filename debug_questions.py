#!/usr/bin/env python3

import sys
import os
sys.path.append('backend')
os.chdir('backend')

from sqlalchemy.orm import sessionmaker
from database import engine, Base
from models import models
import json

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Query all questions
    questions = db.query(models.Question).all()
    print(f"Total questions in database: {len(questions)}")
    
    for i, q in enumerate(questions, 1):
        print(f"\n--- Question {i} ---")
        print(f"ID: {q.id}")
        print(f"Title: {q.title}")
        print(f"Content: {q.content}")
        print(f"Status: {q.status}")
        print(f"Priority: {q.priority}")
        print(f"Tags: {q.tags}")
        print(f"Asked by: {q.asker_id}")
        print(f"Asked at: {q.asked_at}")
        print(f"Answer: {q.answer}")
        
finally:
    db.close()