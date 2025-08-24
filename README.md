# NextGenVDR - AI-Powered Virtual Data Room

NextGenVDR is a modern Virtual Data Room (VDR) platform that revolutionizes due diligence processes through AI automation. Built for M&A transactions, fundraising, and other confidential document sharing scenarios, it combines secure document management with intelligent AI-powered analysis.

## 🎯 What It Achieves

**Core Mission**: Transform traditional due diligence from a manual, time-intensive process into an intelligent, automated workflow that accelerates deal completion while maintaining security and compliance.

**Key Benefits**:
- **AI-Powered Analysis**: Automatic document processing, intelligent Q&A, and context-aware insights
- **Role-Based Access**: Granular permissions for buyers and sellers with secure document sharing
- **Smart Q&A Workflow**: Natural language queries across uploaded documents with source attribution
- **Scalability**: Handle multiple deals simultaneously
- **Insights**: Benchmark against comprehensive deal database

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm package manager

### Backend Setup

1. **Navigate to project root**
   ```bash
   cd nextgenvdr
   ```

2. **Install dependencies with uv**
   ```bash
   uv pip install -r backend/requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other configurations
   ```

4. **Start the FastAPI backend server**
   ```bash
   .venv/bin/python backend/main.py
   ```

   The backend API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm i
   ```

3. **Start the Next.js development server**
   ```bash
   npx next dev
   ```

   The frontend application will be available at `http://localhost:3000`

### 🧠 AI-Powered Features

The backend includes advanced RAG (Retrieval-Augmented Generation) capabilities:

- **Document Processing**: Automatic chunking and embedding of financial documents
- **Agentic RAG**: LangChain-powered intelligent document retrieval
- **Chat Interface**: Natural language queries across uploaded documents
- **Smart Q&A**: Context-aware question answering with source attribution

### API Endpoints

Key backend endpoints include:

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /documents/upload` - Document upload with AI processing
- `POST /ai/rag-chat` - Interactive chat with document context
- `POST /ai/process-document-for-rag` - Process documents for vector search
- `GET /ai/rag-status` - RAG system health check

### Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: FastAPI with SQLAlchemy, OpenAI integration, LangChain RAG
- **Database**: SQLite (development), PostgreSQL (production ready)
- **AI/ML**: OpenAI GPT-4o-mini, text-embedding-3-small, FAISS vector database