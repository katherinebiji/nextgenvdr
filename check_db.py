#!/usr/bin/env python3

import sqlite3
import os

# Connect to the database
db_path = '/Users/anthonyshek/Projects/nextgenvdr/backend/vdr.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if questions table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='questions';")
    table_exists = cursor.fetchone()
    print(f"Questions table exists: {bool(table_exists)}")
    
    if table_exists:
        # Get all questions
        cursor.execute("SELECT * FROM questions")
        questions = cursor.fetchall()
        print(f"Total questions: {len(questions)}")
        
        # Get column names
        cursor.execute("PRAGMA table_info(questions)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"Columns: {column_names}")
        
        for i, question in enumerate(questions, 1):
            print(f"\n--- Question {i} ---")
            for j, value in enumerate(question):
                print(f"{column_names[j]}: {value}")
    else:
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Available tables: {[t[0] for t in tables]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()