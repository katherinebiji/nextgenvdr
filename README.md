# NextGenVDR 🚀

**Transform Due Diligence from 100+ Hours to Minutes**

NextGenVDR is an AI-powered Virtual Data Room that revolutionizes the due diligence process by semi-automating document analysis, risk detection, and deal evaluation through advanced LLM technology.

## 🎯 Problem Statement

Traditional due diligence is:
- **Time-intensive**: 100+ hours of manual document review
- **Error-prone**: Critical red flags often missed in information overload
- **Expensive**: Teams of analysts spending weeks on repetitive analysis
- **Inefficient**: No standardized process for comparing deals or benchmarking metrics

## 💡 Solution

NextGenVDR leverages AI to automate the heavy lifting while keeping humans in control of critical decisions:

### Core Features

TODO: Screenshot of APP

## 🏗️ Two-Sided Platform Architecture

### 📤 Sell Side Features

**Progress Tracking Dashboard**
- Real-time Q&A progress bar showing completion status
- Question checklist with answered/pending response indicators
- Document availability tracker across all required categories

**Document Management**
- Secure document upload with automatic categorization
- Dynamic Q&A routing based on document relevance
- Manual answer capabilities for complex or strategic questions

**Response Workflow**
- Check document relevance against incoming questions
- Supporting evidence linking and organization
- Pending response queue management

### 📥 Buy Side Features

**AI-Powered Analysis Dashboard**
- Progress bar tracking Q&A completion and document review status
- Questions checklist with real-time answer updates
- Available documents explorer with AI-categorized sections

**Intelligent Q&A System**
- Natural language querying across all data room documents
- Chat bot interface with RAG (Retrieval-Augmented Generation)
- Question answered tracking with confidence scoring

**Automated Risk Assessment**
- GAP Analysis comparing claims vs. financial reality
- Red flag detection with supporting evidence citations
- Cross-document consistency validation

**Key Capabilities**
- **Document Intelligence**: Auto-extract financial metrics and KPIs from any format
- **Cross-Reference Validation**: Identify inconsistencies between pitch materials and actual financials
- **Benchmarking**: Compare deal metrics against industry standards and market data
- **Natural Language Processing**: Query complex deal structures in plain English

## 🎯 Target Users

- **Investment Banks** conducting M&A transactions
- **Private Equity Firms** evaluating acquisition targets
- **Venture Capital** performing investment due diligence
- **Corporate Development** teams assessing strategic investments
- **Legal Teams** supporting transaction processes

## ⚡ Value Proposition

- **Speed**: Reduce DD timeline from weeks to days
- **Accuracy**: AI catches patterns humans might miss
- **Cost**: Dramatically lower analyst hours required
- **Scalability**: Handle multiple deals simultaneously
- **Insights**: Benchmark against comprehensive deal database

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- pnpm package manager

### Backend Setup

1. **Navigate to project root**
   ```bash
   cd nextgenvdr
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other configurations
   ```

5. **Start the FastAPI backend server**
   ```bash
   cd backend
   ../.venv/bin/python main.py
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
   pnpm install
   ```

3. **Start the Next.js development server**
   ```bash
   pnpm dev
   ```

   The frontend application will be available at `http://localhost:3000`

**Path Aliases**: The project uses `@/*` path alias that maps to the frontend root directory, allowing imports like `@/components/ui/button` instead of relative paths.

## 🚀 Quick Start

To run both backend and frontend together:

1. **Start the backend** (in terminal 1):
   ```bash
   cd backend
   ../.venv/bin/python main.py
   ```

2. **Start the frontend** (in terminal 2):
   ```bash
   cd frontend
   pnpm dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

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

