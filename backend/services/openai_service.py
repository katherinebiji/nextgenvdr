from openai import OpenAI, APIConnectionError, RateLimitError, APIStatusError
import os
import base64
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=api_key)
    
    def analyze_document(self, document_content: str, document_name: str) -> Dict[str, Any]:
        try:
            content_text = self._extract_text_from_base64(document_content)
            
            prompt = f"""
            Analyze the following document "{document_name}" and provide:
            1. A concise summary (2-3 sentences)
            2. Key points (3-5 bullet points)
            3. Suggested tags (3-5 relevant tags)
            
            Document content:
            {content_text[:4000]}  # Limit content to avoid token limits
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert document analyzer for due diligence processes. Provide structured analysis of business documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            analysis_text = response.choices[0].message.content
            return self._parse_analysis_response(analysis_text)
            
        except APIConnectionError as e:
            return {
                "summary": "Error: Could not connect to OpenAI API",
                "key_points": [],
                "suggested_tags": ["document"]
            }
        except RateLimitError as e:
            return {
                "summary": "Error: OpenAI API rate limit exceeded",
                "key_points": [],
                "suggested_tags": ["document"]
            }
        except APIStatusError as e:
            return {
                "summary": f"Error: OpenAI API returned status {e.status_code}",
                "key_points": [],
                "suggested_tags": ["document"]
            }
        except Exception as e:
            return {
                "summary": f"Error analyzing document: {str(e)}",
                "key_points": [],
                "suggested_tags": ["document"]
            }
    
    def find_relevant_documents(self, question_title: str, question_content: str, documents: List[Dict]) -> List[Dict]:
        try:
            documents_text = "\n".join([
                f"ID: {doc['id']}, Name: {doc['name']}, Tags: {', '.join(doc['tags'])}"
                for doc in documents
            ])
            
            prompt = f"""
            Given the following question and list of documents, rank the documents by relevance (0-100 score):
            
            Question: {question_title}
            Details: {question_content}
            
            Documents:
            {documents_text}
            
            Respond with JSON format:
            {{"matches": [{{"document_id": "id", "score": 85, "reasons": ["reason1", "reason2"]}}]}}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at matching questions to relevant documents in due diligence processes. Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.2
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("matches", [])
            
        except Exception as e:
            return []
    
    def generate_answer(self, question_title: str, question_content: str, document_contents: List[str]) -> Dict[str, Any]:
        try:
            combined_content = "\n\n---\n\n".join(document_contents[:3])  # Limit to 3 docs
            
            prompt = f"""
            Based on the provided documents, answer the following question:
            
            Question: {question_title}
            Details: {question_content}
            
            Relevant Documents:
            {combined_content[:6000]}  # Limit to avoid token limits
            
            Provide a comprehensive answer based only on the information in the documents.
            Include specific references to the documents when possible.
            If the documents don't contain enough information, clearly state what's missing.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert analyst helping with due diligence questions. Provide accurate, well-reasoned answers based strictly on the provided documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.4
            )
            
            return {
                "suggested_answer": response.choices[0].message.content,
                "confidence": 0.8,  # Could be enhanced with more sophisticated confidence scoring
                "sources": [f"Document {i+1}" for i in range(len(document_contents))]
            }
            
        except Exception as e:
            return {
                "suggested_answer": f"Error generating answer: {str(e)}",
                "confidence": 0.0,
                "sources": []
            }
    
    def extract_tags(self, document_content: str, document_name: str) -> List[str]:
        try:
            content_text = self._extract_text_from_base64(document_content)
            
            prompt = f"""
            Extract 3-7 relevant tags for this document "{document_name}":
            
            {content_text[:2000]}
            
            Return only a JSON array of lowercase tags, like: ["financial", "contract", "legal"]
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Extract relevant tags for business documents. Return only valid JSON array."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.2
            )
            
            tags = json.loads(response.choices[0].message.content)
            return tags if isinstance(tags, list) else []
            
        except Exception as e:
            return ["document"]
    
    def _extract_text_from_base64(self, base64_content: str) -> str:
        try:
            if base64_content.startswith("data:"):
                base64_content = base64_content.split(",")[1]
            
            decoded_bytes = base64.b64decode(base64_content)
            
            # Try to decode as text (for text files, PDFs would need different handling)
            try:
                return decoded_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # For binary files, return filename and metadata info
                return f"Binary file content (size: {len(decoded_bytes)} bytes)"
                
        except Exception as e:
            return f"Error extracting content: {str(e)}"
    
    def _parse_analysis_response(self, analysis_text: str) -> Dict[str, Any]:
        try:
            lines = analysis_text.strip().split('\n')
            summary = ""
            key_points = []
            suggested_tags = []
            
            current_section = None
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if "summary" in line.lower():
                    current_section = "summary"
                elif "key points" in line.lower() or "points" in line.lower():
                    current_section = "points"
                elif "tags" in line.lower():
                    current_section = "tags"
                elif line.startswith("-") or line.startswith("•"):
                    if current_section == "points":
                        key_points.append(line[1:].strip())
                    elif current_section == "tags":
                        tag = line[1:].strip().lower()
                        if tag:
                            suggested_tags.append(tag)
                elif current_section == "summary" and line:
                    summary += line + " "
            
            return {
                "summary": summary.strip() or "Document analysis completed",
                "key_points": key_points or ["No key points identified"],
                "suggested_tags": suggested_tags or ["document"]
            }
            
        except Exception as e:
            return {
                "summary": "Error parsing analysis",
                "key_points": [],
                "suggested_tags": ["document"]
            }