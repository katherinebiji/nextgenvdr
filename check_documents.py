#!/usr/bin/env python3

import sqlite3
import os

# Connect to the database
db_path = '/Users/anthonyshek/Projects/nextgenvdr/backend/vdr.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if documents table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents';")
    table_exists = cursor.fetchone()
    print(f"Documents table exists: {bool(table_exists)}")
    
    if table_exists:
        # Get all documents
        cursor.execute("SELECT * FROM documents")
        documents = cursor.fetchall()
        print(f"Total documents: {len(documents)}")
        
        # Get column names
        cursor.execute("PRAGMA table_info(documents)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"Columns: {column_names}")
        
        for i, doc in enumerate(documents, 1):
            print(f"\n--- Document {i} ---")
            for j, value in enumerate(doc):
                if column_names[j] == 'content' and value:
                    # Show first 200 chars of content
                    content_preview = str(value)[:200] + "..." if len(str(value)) > 200 else str(value)
                    print(f"{column_names[j]}: {content_preview}")
                else:
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