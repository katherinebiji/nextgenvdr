#!/usr/bin/env python3

import sqlite3
import os

# Connect to the database
db_path = '/Users/anthonyshek/Projects/nextgenvdr/backend/vdr.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    table_exists = cursor.fetchone()
    print(f"Users table exists: {bool(table_exists)}")
    
    if table_exists:
        # Get all users
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        print(f"Total users: {len(users)}")
        
        # Get column names
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"Columns: {column_names}")
        
        for i, user in enumerate(users, 1):
            print(f"\n--- User {i} ---")
            for j, value in enumerate(user):
                print(f"{column_names[j]}: {value}")
    else:
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Available tables: {[t[0] for t in tables]}")
        
    # Also check the questions and their user relationships
    print(f"\n=== Question-User Relationships ===")
    cursor.execute("""
        SELECT q.id, q.title, q.asked_by_id, u.email, u.role 
        FROM questions q 
        LEFT JOIN users u ON q.asked_by_id = u.id
        ORDER BY q.asked_at DESC LIMIT 10
    """)
    relationships = cursor.fetchall()
    for rel in relationships:
        print(f"Question: {rel[1]} | Asked by: {rel[3]} ({rel[4]}) | User ID: {rel[2]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()