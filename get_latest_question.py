#!/usr/bin/env python3

import sqlite3
import os

# Connect to the database
db_path = '/Users/anthonyshek/Projects/nextgenvdr/backend/vdr.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Get the latest question about company name
    cursor.execute("""
        SELECT id, title, content, status, asked_at 
        FROM questions 
        WHERE content LIKE '%company%name%' OR title LIKE '%company%name%'
        ORDER BY asked_at DESC LIMIT 1
    """)
    
    latest_question = cursor.fetchone()
    if latest_question:
        print(f"Latest company name question:")
        print(f"ID: {latest_question[0]}")
        print(f"Title: {latest_question[1]}")
        print(f"Content: {latest_question[2]}")
        print(f"Status: {latest_question[3]}")
        print(f"Asked at: {latest_question[4]}")
    else:
        # If no specific company name question, get the latest pending question
        cursor.execute("""
            SELECT id, title, content, status, asked_at 
            FROM questions 
            WHERE status = 'pending'
            ORDER BY asked_at DESC LIMIT 1
        """)
        
        latest_question = cursor.fetchone()
        if latest_question:
            print(f"Latest pending question:")
            print(f"ID: {latest_question[0]}")
            print(f"Title: {latest_question[1]}")
            print(f"Content: {latest_question[2]}")
            print(f"Status: {latest_question[3]}")
            print(f"Asked at: {latest_question[4]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()