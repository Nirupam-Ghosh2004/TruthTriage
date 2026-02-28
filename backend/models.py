# backend/models.py

from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    query: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is paracetamol used for?"
            }
        }

class Source(BaseModel):
    """Source document information"""
    content: str
    metadata: Dict
    similarity_score: Optional[float] = None

class MedicineInfo(BaseModel):
    """Medicine suggestion information"""
    name: str
    usage: str
    source: Optional[str] = None

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str
    sources: List[Source]
    medicines: Optional[List[MedicineInfo]] = None
    specialist_type: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Paracetamol is used for...",
                "sources": [
                    {
                        "content": "Paracetamol is a commonly used medicine...",
                        "metadata": {"page": 1, "source": "WHO.pdf"},
                        "similarity_score": 0.87
                    }
                ],
                "medicines": [
                    {
                        "name": "Paracetamol",
                        "usage": "Pain relief and fever reduction",
                        "source": "WHO.pdf"
                    }
                ]
            }
        }

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str

class DoctorRequest(BaseModel):
    """Request model for doctor finder endpoint"""
    query: str
    location: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "heart pain",
                "location": "Kolkata"
            }
        }

class Doctor(BaseModel):
    """Doctor/facility information"""
    name: str
    specialization: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None

class DoctorResponse(BaseModel):
    """Response model for doctor finder endpoint"""
    doctors: List[Doctor]
    location: str
    specialization: str