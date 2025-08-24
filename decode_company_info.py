#!/usr/bin/env python3

import base64

# Base64 content from the test_company_info.txt document
base64_content = "VGVjaENvcnAgQ29tcGFueSBJbmZvcm1hdGlvbgoKQW5udWFsIFJldmVudWU6ICQ1MCBtaWxsaW9uIGluIDIwMjQsIGdyb3dpbmcgMjUlIHllYXItb3Zlci15ZWFyCkVtcGxveWVlczogMjUwIGZ1bGwtdGltZSBlbXBsb3llZXMgYWNyb3NzIHRocmVlIG9mZmljZXMKRUJJVERBIE1hcmdpbjogMTglCkluZHVzdHJ5OiBUZWNobm9sb2d5IFNvZnR3YXJlCkhlYWRxdWFydGVyczogU2FuIEZyYW5jaXNjbywgQ0EKQ0VPOiBKb2huIFNtaXRoCkZvdW5kZWQ6IDIwMTAKTWFya2V0IFBvc2l0aW9uOiBMZWFkaW5nIHByb3ZpZGVyIG9mIGVudGVycHJpc2Ugc29mdHdhcmUgc29sdXRpb25zCktleSBQcm9kdWN0czogQ2xvdWQtYmFzZWQgQ1JNLCBQcm9qZWN0IE1hbmFnZW1lbnQgU29mdHdhcmUsIEJ1c2luZXNzIEludGVsbGlnZW5jZSBUb29scwpDb21wZXRpdGl2ZSBBZHZhbnRhZ2VzOiBTdHJvbmcgY3VzdG9tZXIgcmV0ZW50aW9uLCBTY2FsYWJsZSBhcmNoaXRlY3R1cmUsIEV4cGVyaWVuY2VkIGRldmVsb3BtZW50IHRlYW0="

try:
    # Decode the base64 content
    decoded_content = base64.b64decode(base64_content).decode('utf-8')
    print("Content of test_company_info.txt:")
    print("=" * 50)
    print(decoded_content)
    print("=" * 50)
    
    # Check if it contains company name
    if "TechCorp" in decoded_content:
        print("\n✅ COMPANY NAME FOUND: TechCorp")
        print("This document should be able to answer 'What is the name of the company?'")
    else:
        print("\n❌ No clear company name found in the document")
        
except Exception as e:
    print(f"Error decoding content: {e}")