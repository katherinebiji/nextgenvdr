- **Scalability**: Handle multiple deals simultaneously
- **Insights**: Benchmark against comprehensive deal database

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- pnpm package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies with uv**
   ```bash
   uv sync
   ```

3. **Set up environment variables**
   ```bash
   cp ../.env.example ../.env
   # Edit .env with your OpenAI API key and other configurations
   ```

4. **Start the FastAPI backend server**
   ```bash
   uv run python start.py
   ```

   The backend API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd "Virtual Data Room"
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