from typing import List, Dict, Any, Optional
import os
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from .document_processor import DocumentProcessor
import json


class AgenticRAGService:
    """
    Advanced RAG service that uses agents to intelligently decide when and how to use retrieval.
    Implements best practices from LangChain 2025 for agentic RAG systems.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-4o-mini",
            temperature=0.3
        )
        self.doc_processor = DocumentProcessor()
        
        # Create retriever tool
        self.retriever_tool = self._create_retriever_tool()
        
        # Initialize agent
        self.agent_executor = self._create_agent()
    
    @tool
    def search_documents(query: str, k: int = 5) -> str:
        """
        Search through uploaded financial documents for information relevant to the query.
        
        Args:
            query: The search query to find relevant document chunks
            k: Number of relevant chunks to retrieve (default 5)
            
        Returns:
            String containing relevant document excerpts with metadata
        """
        # This will be bound to the actual instance method
        pass
    
    def _create_retriever_tool(self):
        """Create a tool that the agent can use to search documents."""
        @tool
        def search_documents(query: str, k: int = 5) -> str:
            """Search through uploaded financial documents for information relevant to the query. Use this when you need specific information from the documents to answer a question."""
            try:
                relevant_docs = self.doc_processor.search_similar_documents(
                    query=query, 
                    k=k, 
                    score_threshold=0.7
                )
                
                if not relevant_docs:
                    return "No relevant documents found for the query."
                
                # Format results for the agent
                result = f"Found {len(relevant_docs)} relevant document chunks:\n\n"
                
                for i, doc in enumerate(relevant_docs, 1):
                    result += f"--- Document {i} ---\n"
                    result += f"Source: {doc['document_name']} (Chunk {doc['chunk_index']})\n"
                    result += f"Relevance Score: {doc['similarity_score']:.2f}\n"
                    result += f"Content: {doc['content']}\n\n"
                
                return result
                
            except Exception as e:
                return f"Error searching documents: {str(e)}"
        
        return search_documents
    
    def _create_agent(self) -> AgentExecutor:
        """Create an agent that can decide when to use the retriever tool."""
        
        # System prompt for the agent
        system_prompt = """You are an expert financial analyst helping with due diligence questions.

You have access to a tool that can search through uploaded financial documents. Use this tool when:
1. The user asks specific questions about financial data, contracts, or business information
2. You need concrete evidence or specific details from the documents
3. The question requires factual information that would be found in documents

DO NOT use the search tool when:
1. The question is general and doesn't require specific document information
2. You can provide a helpful response based on general knowledge
3. The question is about the process rather than specific content

When you do use the search tool:
1. Formulate clear, specific search queries
2. Use multiple searches if needed to gather comprehensive information
3. Synthesize information from multiple sources
4. Always cite the specific documents and sources you found information in

When answering:
1. Be precise and factual
2. Include specific references to documents when applicable
3. If documents don't contain enough information, clearly state what's missing
4. Provide structured, easy-to-understand responses
5. Highlight key financial metrics, risks, or important findings

Remember: You are helping with due diligence, so accuracy and thoroughness are critical."""

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create agent
        tools = [self.retriever_tool]
        agent = create_openai_functions_agent(self.llm, tools, prompt)
        
        # Create agent executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5
        )
        
        return agent_executor
    
    def answer_question(self, question: str, context: Optional[str] = None, chat_history: Optional[List] = None) -> Dict[str, Any]:
        """
        Answer a question using the agentic RAG approach.
        
        Args:
            question: The question to answer
            context: Optional additional context
            chat_history: Optional chat history for context
            
        Returns:
            Dictionary containing the answer and metadata
        """
        try:
            # Prepare input
            input_text = question
            if context:
                input_text = f"Context: {context}\n\nQuestion: {question}"
            
            # Run the agent
            result = self.agent_executor.invoke({
                "input": input_text,
                "chat_history": chat_history or []
            })
            
            return {
                "answer": result["output"],
                "success": True,
                "agent_used_retrieval": "search_documents" in str(result.get("intermediate_steps", [])),
                "sources_consulted": self._extract_sources_from_result(result)
            }
            
        except Exception as e:
            return {
                "answer": f"Error processing question: {str(e)}",
                "success": False,
                "agent_used_retrieval": False,
                "sources_consulted": []
            }
    
    def answer_predefined_question(self, question_data: Dict[str, Any], relevant_document_ids: List[str] = None) -> Dict[str, Any]:
        """
        Answer a predefined question from the question list, optionally focusing on specific documents.
        
        Args:
            question_data: Dictionary containing question title, content, and metadata
            relevant_document_ids: Optional list of document IDs to focus the search on
            
        Returns:
            Dictionary containing the comprehensive answer
        """
        try:
            question_title = question_data.get("title", "")
            question_content = question_data.get("content", "")
            
            # Create comprehensive query
            query = f"Question: {question_title}\nDetails: {question_content}"
            
            # If specific documents are provided, search within those first
            if relevant_document_ids:
                # Get chunks from specific documents
                all_relevant_chunks = []
                for doc_id in relevant_document_ids:
                    chunks = self.doc_processor.get_document_chunks(doc_id)
                    all_relevant_chunks.extend(chunks)
                
                # Also do a general search
                search_results = self.doc_processor.search_similar_documents(
                    query=query, 
                    k=8, 
                    score_threshold=0.6
                )
                
                # Combine and deduplicate
                all_sources = all_relevant_chunks + [
                    {"content": r["content"], "metadata": r["metadata"]} 
                    for r in search_results
                ]
                
                # Remove duplicates based on content similarity
                unique_sources = self._deduplicate_sources(all_sources)
                
                # Format context for the agent
                context = self._format_sources_for_context(unique_sources[:6])  # Limit to 6 most relevant
                query_with_context = f"Based on the following document excerpts:\n\n{context}\n\n{query}"
                
            else:
                query_with_context = query
            
            # Use the agent to answer
            result = self.answer_question(query_with_context)
            
            # Enhance with confidence scoring
            confidence_score = self._calculate_confidence_score(result, question_data)
            
            return {
                "suggested_answer": result["answer"],
                "confidence": confidence_score,
                "sources": result.get("sources_consulted", []),
                "agent_used_retrieval": result.get("agent_used_retrieval", False),
                "success": result["success"],
                "question_type": question_data.get("priority", "medium")
            }
            
        except Exception as e:
            return {
                "suggested_answer": f"Error answering predefined question: {str(e)}",
                "confidence": 0.0,
                "sources": [],
                "agent_used_retrieval": False,
                "success": False
            }
    
    def chat_with_documents(self, message: str, chat_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Interactive chat interface that can reference documents when needed.
        
        Args:
            message: User message
            chat_history: Previous chat messages
            
        Returns:
            Chat response with document context when relevant
        """
        try:
            # Convert chat history to LangChain format
            lc_chat_history = []
            if chat_history:
                for msg in chat_history[-10:]:  # Keep last 10 messages for context
                    if msg.get("role") == "user":
                        lc_chat_history.append(HumanMessage(content=msg["content"]))
                    elif msg.get("role") == "assistant":
                        lc_chat_history.append(SystemMessage(content=msg["content"]))
            
            # Use agent to process the message
            result = self.answer_question(message, chat_history=lc_chat_history)
            
            return {
                "response": result["answer"],
                "used_documents": result.get("agent_used_retrieval", False),
                "sources": result.get("sources_consulted", []),
                "success": result["success"],
                "message_type": "chat"
            }
            
        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error: {str(e)}",
                "used_documents": False,
                "sources": [],
                "success": False,
                "message_type": "error"
            }
    
    def _extract_sources_from_result(self, result: Dict) -> List[str]:
        """Extract document sources from agent execution result."""
        sources = []
        try:
            intermediate_steps = result.get("intermediate_steps", [])
            for step in intermediate_steps:
                if len(step) > 1 and "Document" in str(step[1]):
                    # Parse document names from the tool output
                    output = str(step[1])
                    lines = output.split('\n')
                    for line in lines:
                        if line.startswith("Source: "):
                            source = line.replace("Source: ", "").strip()
                            if source not in sources:
                                sources.append(source)
        except Exception:
            pass
        return sources
    
    def _deduplicate_sources(self, sources: List[Dict]) -> List[Dict]:
        """Remove duplicate sources based on content similarity."""
        unique_sources = []
        seen_content = set()
        
        for source in sources:
            content_hash = hash(source["content"][:200])  # Hash first 200 chars
            if content_hash not in seen_content:
                unique_sources.append(source)
                seen_content.add(content_hash)
        
        return unique_sources
    
    def _format_sources_for_context(self, sources: List[Dict]) -> str:
        """Format sources into context string for the agent."""
        context = ""
        for i, source in enumerate(sources, 1):
            metadata = source["metadata"]
            context += f"--- Source {i}: {metadata.get('document_name', 'Unknown')} ---\n"
            context += f"{source['content']}\n\n"
        return context
    
    def _calculate_confidence_score(self, result: Dict, question_data: Dict) -> float:
        """Calculate confidence score based on result quality."""
        base_score = 0.7 if result["success"] else 0.0
        
        # Increase confidence if retrieval was used
        if result.get("agent_used_retrieval", False):
            base_score += 0.2
        
        # Increase confidence if sources were found
        if result.get("sources_consulted"):
            base_score += 0.1
        
        # Adjust based on answer length (longer answers often more comprehensive)
        answer_length = len(result.get("answer", ""))
        if answer_length > 200:
            base_score += 0.05
        
        return min(base_score, 1.0)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get status of the agentic RAG system."""
        vector_stats = self.doc_processor.get_vector_store_stats()
        
        return {
            "agent_initialized": self.agent_executor is not None,
            "retriever_available": self.retriever_tool is not None,
            "llm_model": "gpt-4o-mini",
            "vector_store_stats": vector_stats,
            "tools_available": ["search_documents"],
            "system_ready": all([
                self.agent_executor is not None,
                self.retriever_tool is not None,
                vector_stats.get("vector_store_exists", False)
            ])
        }