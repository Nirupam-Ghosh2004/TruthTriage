from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import (
    ChatRequest, ChatResponse, HealthResponse,
    DoctorRequest, DoctorResponse
)
from rag_service import rag_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TruthTriage API",
    description="Medical AI Assistant Backend",
    version="1.0.0"
)

# CORS - Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if API is running"""
    return {
        "status": "healthy",
        "message": "TruthTriage API is running"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send medical query and get answer with sources"""
    try:
        logger.info(f"Received query: {request.query}")
        result = rag_service.get_answer(request.query)
        logger.info("Generated answer successfully")
        return result
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/doctors", response_model=DoctorResponse)
async def find_doctors(request: DoctorRequest):
    """Find specialist doctors near a location based on medical query"""
    try:
        logger.info(f"Doctor search: query='{request.query}', location='{request.location}'")
        result = rag_service.find_doctors(request.query, request.location)
        logger.info(f"Found {len(result['doctors'])} doctors")
        return result
    except Exception as e:
        logger.error(f"Doctor search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def get_documents():
    """Get loaded documents"""
    import os, glob
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(base_dir, "..", "data"))
    pdf_files = glob.glob(os.path.join(data_dir, "*.pdf"))
    docs = [{"name": os.path.basename(f), "status": "loaded"} for f in pdf_files]
    return {"documents": docs}

@app.get("/")
async def root():
    """Welcome message"""
    return {
        "message": "Welcome to TruthTriage API",
        "docs": "/docs",
        "health": "/health"
    }