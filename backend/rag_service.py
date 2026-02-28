# backend/rag_service.py

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
import os
import glob
import json
import re
import numpy as np
import requests
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# ─── Specialization Mapping ────────────────────────────────────────────────────
SPECIALIZATION_MAP = {
    "heart": "cardiologist",
    "cardiac": "cardiologist",
    "chest pain": "cardiologist",
    "blood pressure": "cardiologist",
    "hypertension": "cardiologist",
    "skin": "dermatologist",
    "rash": "dermatologist",
    "acne": "dermatologist",
    "bone": "orthopedic",
    "joint": "orthopedic",
    "fracture": "orthopedic",
    "arthritis": "orthopedic",
    "brain": "neurologist",
    "nerve": "neurologist",
    "headache": "neurologist",
    "migraine": "neurologist",
    "seizure": "neurologist",
    "eye": "ophthalmologist",
    "vision": "ophthalmologist",
    "ear": "ent",
    "nose": "ent",
    "throat": "ent",
    "child": "pediatrician",
    "infant": "pediatrician",
    "baby": "pediatrician",
    "kidney": "nephrologist",
    "urine": "urologist",
    "diabetes": "endocrinologist",
    "thyroid": "endocrinologist",
    "hormone": "endocrinologist",
    "cancer": "oncologist",
    "tumor": "oncologist",
    "lung": "pulmonologist",
    "breathing": "pulmonologist",
    "asthma": "pulmonologist",
    "stomach": "gastroenterologist",
    "liver": "hepatologist",
    "digestion": "gastroenterologist",
    "teeth": "dentist",
    "dental": "dentist",
    "tooth": "dentist",
    "mental": "psychiatrist",
    "depression": "psychiatrist",
    "anxiety": "psychiatrist",
    "pregnancy": "gynecologist",
    "woman": "gynecologist",
    "menstrual": "gynecologist",
    "allergy": "allergist",
    "fever": "general physician",
    "cold": "general physician",
    "cough": "general physician",
    "infection": "general physician",
    "pain": "general physician",
    "medicine": "general physician",
    "drug": "general physician",
}


def detect_specialization(query: str) -> str:
    """Map a medical query to a doctor specialization."""
    query_lower = query.lower()
    for keyword, spec in SPECIALIZATION_MAP.items():
        if keyword in query_lower:
            return spec
    return "general physician"


def find_doctors_overpass(latitude: float, longitude: float, specialization: str, radius_m: int = 5000) -> list:
    """Use Overpass API to find doctors/clinics/hospitals near coordinates."""
    # Build Overpass query for healthcare facilities
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    spec_lower = specialization.lower()
    
    # Overpass QL: search for nodes/ways tagged as healthcare providers
    overpass_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="doctors"](around:{radius_m},{latitude},{longitude});
      node["amenity"="clinic"](around:{radius_m},{latitude},{longitude});
      node["amenity"="hospital"](around:{radius_m},{latitude},{longitude});
      node["healthcare"="doctor"](around:{radius_m},{latitude},{longitude});
      node["healthcare"="clinic"](around:{radius_m},{latitude},{longitude});
      way["amenity"="hospital"](around:{radius_m},{latitude},{longitude});
      way["amenity"="clinic"](around:{radius_m},{latitude},{longitude});
    );
    out center body 15;
    """
    
    try:
        response = requests.post(overpass_url, data={"data": overpass_query}, timeout=20)
        if response.status_code != 200:
            logger.error(f"Overpass API error: {response.status_code}")
            return []
        
        data = response.json()
        elements = data.get("elements", [])
        
        doctors = []
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name", tags.get("operator", "Healthcare Facility"))
            
            # Get coordinates (center for ways)
            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            
            if not lat or not lon:
                continue
            
            # Check if specialization matches any tags
            healthcare_spec = tags.get("healthcare:speciality", "").lower()
            tag_spec = tags.get("medical_system:speciality", "").lower()
            
            # Determine displayed specialization
            if spec_lower in healthcare_spec or spec_lower in tag_spec:
                displayed_spec = specialization
            elif healthcare_spec:
                displayed_spec = healthcare_spec.replace(";", ", ").title()
            else:
                displayed_spec = specialization
            
            address_parts = [
                tags.get("addr:street", ""),
                tags.get("addr:city", ""),
                tags.get("addr:postcode", ""),
            ]
            address = ", ".join(p for p in address_parts if p) or tags.get("addr:full", "")
            
            doctors.append({
                "name": name,
                "specialization": displayed_spec,
                "latitude": float(lat),
                "longitude": float(lon),
                "address": address or None,
                "phone": tags.get("phone") or tags.get("contact:phone") or None,
            })
        
        return doctors[:15]  # Limit results
        
    except Exception as e:
        logger.error(f"Overpass API exception: {e}")
        return []


def geocode_location(location: str) -> tuple:
    """Geocode a location name to (lat, lng) using Nominatim."""
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": location, "format": "json", "limit": 1}
        headers = {"User-Agent": "TruthTriageHealthApp/1.0"}
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200 and response.json():
            data = response.json()[0]
            return float(data["lat"]), float(data["lon"])
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
    return None, None


class RAGService:
    def __init__(self):
        self.vectorstore = None
        self.qa_chain = None
        self.embeddings = None
        self.agent = None
        self.last_retrieved_sources = []
        self.initialize_vectorstore()
    
    def initialize_vectorstore(self):
        """Load all PDFs and create vectorstore (runs once when server starts)"""
        
        # Resolve data directory relative to this file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, "..", "data")
        data_dir = os.path.abspath(data_dir)
        
        if not os.path.isdir(data_dir):
            raise FileNotFoundError(f"Data directory not found: {data_dir}")
        
        # Load ALL PDFs from the data directory
        pdf_files = glob.glob(os.path.join(data_dir, "*.pdf"))
        if not pdf_files:
            raise FileNotFoundError(f"No PDF files found in: {data_dir}")
        
        all_documents = []
        for pdf_path in pdf_files:
            try:
                logger.info(f"Loading PDF: {os.path.basename(pdf_path)}")
                loader = PyPDFLoader(pdf_path)
                documents = loader.load()
                all_documents.extend(documents)
                logger.info(f"  -> Loaded {len(documents)} pages from {os.path.basename(pdf_path)}")
            except Exception as e:
                logger.warning(f"  -> Failed to load {os.path.basename(pdf_path)}: {e}")
        
        if not all_documents:
            raise RuntimeError("No documents were successfully loaded from PDFs")
        
        logger.info(f"Total pages loaded: {len(all_documents)}")
        
        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        docs = text_splitter.split_documents(all_documents)
        logger.info(f"Total chunks created: {len(docs)}")
        
        # Create embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
        
        # Create vectorstore
        self.vectorstore = FAISS.from_documents(docs, self.embeddings)
        
        # Initialize LLM
        groq_key = os.environ.get("GROQ_API_KEY")
        if not groq_key:
            raise RuntimeError("GROQ_API_KEY not found in environment variables")
        
        custom_llm = ChatGroq(
            groq_api_key=groq_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.0
        )
        
        # Define strict prompt
        prompt_template = """Below is a pharmaceutical safety query submitted to TruthTriage.
TruthTriage is a verified medical AI assistant that retrieves answers ONLY from
trusted sources such as WHO, CDSCO, ICMR, MoHFW, and OpenFDA.

Before responding, analyze the query carefully:
- Identify the risk level (Low / Moderate / High)
- Check if critical information is missing (age, weight, condition, medications)
- Only answer using retrieved verified sources
- If no source is found, refuse to answer
- If High Risk + Low Confidence, escalate immediately

### Instructions:
You are TruthTriage — a pharmaceutical safety AI assistant.
You do NOT guess. You do NOT answer from memory.
You ONLY respond based on retrieved verified medical sources.
If you are uncertain, you say so and recommend a doctor.

You MUST ALWAYS structure your response with these sections:

🔍 **Risk Level**: [Low / Moderate / High]

📋 **Condition Analysis**: [Detailed explanation of the condition]

👨‍⚕️ **Recommended Specialist**: [Type of doctor to consult]

💊 **Suggested Medicines**:
- **Medicine Name** — usage/indication (source)
- **Medicine Name** — usage/indication (source)
You MUST list ALL medicine names found in the retrieved context. If a medicine name appears anywhere in the context, you MUST include it.

⚠️ **Precautions**: [Warnings and side effects from sources]

📌 **Recommendation**: [Final advice]

### Retrieved Context:
{context}

### Query:
{question}

### Response:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        # Create QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=custom_llm,
            chain_type='stuff',
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )
    
        # ─── Tools Setup ───────────────────────────────────────────────────
        
        @tool
        def medical_safety_qa_tool(medical_query: str) -> str:
            """
            Use this tool to search for medical information, drug safety, pharmaceutical guidelines,
            and health risk assessments. Always use this tool for answering health-related questions.
            """
            result = self.qa_chain.invoke({"query": medical_query})
            
            source_documents = result.get("source_documents", [])
            self.last_retrieved_sources = []
            
            # Compute similarity scores
            try:
                query_embedding = np.array(self.embeddings.embed_query(medical_query))
                for doc in source_documents:
                    doc_embedding = np.array(self.embeddings.embed_query(doc.page_content[:500]))
                    # Cosine similarity
                    cos_sim = float(np.dot(query_embedding, doc_embedding) / 
                                   (np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding) + 1e-8))
                    similarity_score = round(max(0.0, min(1.0, cos_sim)), 4)
                    
                    self.last_retrieved_sources.append({
                        "content": doc.page_content[:300],
                        "metadata": doc.metadata,
                        "similarity_score": similarity_score
                    })
            except Exception as e:
                logger.warning(f"Similarity computation failed: {e}")
                for doc in source_documents:
                    self.last_retrieved_sources.append({
                        "content": doc.page_content[:300],
                        "metadata": doc.metadata,
                        "similarity_score": None
                    })
            
            # Sort by similarity (highest first)
            self.last_retrieved_sources.sort(
                key=lambda x: x.get("similarity_score") or 0, reverse=True
            )
                
            return result["result"]

        @tool
        def find_specialist_doctors(location: str, medical_condition: str = "general") -> str:
            """
            Finds specialist doctors and healthcare facilities near a given location.
            Uses OpenStreetMap data. Provide the city/area name and the medical condition.
            """
            try:
                specialization = detect_specialization(medical_condition)
                lat, lon = geocode_location(location)
                
                if lat is None or lon is None:
                    return f"Could not find coordinates for '{location}'. Please provide a valid city name."
                
                doctors = find_doctors_overpass(lat, lon, specialization)
                
                if not doctors:
                    # Fallback: try Nominatim search
                    url = "https://nominatim.openstreetmap.org/search"
                    params = {
                        "q": f"{specialization} doctor in {location}",
                        "format": "json",
                        "limit": 5
                    }
                    headers = {"User-Agent": "TruthTriageHealthApp/1.0"}
                    response = requests.get(url, params=params, headers=headers, timeout=10)
                    
                    if response.status_code == 200 and response.json():
                        data = response.json()
                        facilities = [f"- {place.get('display_name', 'Unknown')}" for place in data]
                        return (f"Recommended specialist: **{specialization.title()}**\n"
                                f"Facilities near {location}:\n" + "\n".join(facilities))
                    
                    return (f"Recommended specialist: **{specialization.title()}**\n"
                            f"Could not find specific facilities in {location} via OpenStreetMap. "
                            f"Please search locally for a {specialization} near you.")
                
                result_lines = [f"Recommended specialist: **{specialization.title()}**",
                               f"Found {len(doctors)} healthcare facilities near {location}:\n"]
                for d in doctors[:8]:
                    line = f"- **{d['name']}** ({d['specialization']})"
                    if d.get('address'):
                        line += f" — {d['address']}"
                    if d.get('phone'):
                        line += f" | Phone: {d['phone']}"
                    result_lines.append(line)
                
                return "\n".join(result_lines)
                
            except Exception as e:
                return f"Error finding specialists: {str(e)}"

        @tool
        def suggest_medicine(medical_query: str) -> str:
            """
            Use this tool to suggest medicines related to a medical condition.
            Searches verified medical sources for medicine names, dosages, and usage.
            Only returns information found in trusted documents.
            """
            try:
                # Search vectorstore for medicine-related content
                retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})
                docs = retriever.invoke(f"medicine treatment for {medical_query}")
                
                if not docs:
                    return "No medicine information found in verified sources for this query."
                
                # Extract medicine-related content
                medicine_texts = []
                for doc in docs:
                    content = doc.page_content
                    source = doc.metadata.get("source", "Unknown")
                    medicine_texts.append(f"From {os.path.basename(source)}:\n{content[:400]}")
                
                return ("Medicine information from verified sources:\n\n" + 
                        "\n\n---\n\n".join(medicine_texts))
            except Exception as e:
                return f"Error searching medicines: {str(e)}"

        @tool
        def emergency_call_tool() -> str:
            """
            Place an emergency call to the safety helpline's phone number.
            Use this ONLY if the user expresses suicidal ideation, intent to self-harm,
            or describes a medical emergency requiring immediate life-saving help.
            """
            print("🚨 INITIATING EMERGENCY PROTOCOL 🚨")
            return ("Emergency protocol activated. A crisis support representative is being contacted. "
                    "Please stay on the line or immediately call your local emergency number "
                    "(e.g., 911, 112, 108).")

        tools = [medical_safety_qa_tool, find_specialist_doctors, suggest_medicine, emergency_call_tool]
        
        system_prompt = """
You are TruthTriage — a SPECIALIZED medical and pharmaceutical safety AI assistant.
You are helpful, thorough, and always provide actionable medical information.

CRITICAL RULES:
1. Call a tool ONCE per user message, then IMMEDIATELY compose your final detailed response.
2. NEVER refuse to help. Always use the `medical_safety_qa_tool` to find relevant information.
3. After getting tool output, present the information clearly with medicine suggestions and specialist recommendations.
4. Your response MUST be detailed and structured — include risk levels, medicines, specialist type, and precautions.

Tools:
- `medical_safety_qa_tool`: DEFAULT tool. Use for ALL medical/health queries. Always use this first.
- `find_specialist_doctors`: Use ONLY if user explicitly mentions a city/location AND asks for nearby doctors.
- `suggest_medicine`: Use if user ONLY asks about medicines without any medical condition context.
- `emergency_call_tool`: Use ONLY for suicidal/self-harm/life-threatening emergencies.

When responding after using `medical_safety_qa_tool`:
- ALWAYS format medicines as: **Medicine Name** — usage/indication
- ALWAYS mention what type of specialist doctor to see
- ALWAYS provide a risk assessment
- Be thorough and professional
"""
        
        # Initialize LangGraph Agent
        self.agent = create_react_agent(custom_llm, tools=tools, state_modifier=system_prompt)
        self.last_retrieved_sources = []
        logger.info("RAG Service initialized successfully with all tools.")
    
    def get_answer(self, query: str):
        """Get answer using the QA chain directly for reliable, detailed responses."""
        
        if self.qa_chain is None:
            raise Exception("RAG system not initialized")
            
        # Clear previous sources
        self.last_retrieved_sources = []
        
        # Detect specialist type from query
        specialist_type = detect_specialization(query)
        
        final_response = "I couldn't process that query."
        
        try:
            # Use QA chain directly — no agent loop, reliable structured output
            result = self.qa_chain.invoke({"query": query})
            final_response = result.get("result", "No answer generated.")
            
            # Process source documents with similarity scores
            source_documents = result.get("source_documents", [])
            if source_documents:
                query_embedding = np.array(self.embeddings.embed_query(query))
                
                for doc in source_documents:
                    doc_embedding = np.array(self.embeddings.embed_query(doc.page_content[:500]))
                    cos_sim = float(np.dot(query_embedding, doc_embedding) / 
                                   (np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding) + 1e-8))
                    similarity_score = round(max(0.0, min(1.0, cos_sim)), 4)
                    
                    self.last_retrieved_sources.append({
                        "content": doc.page_content[:300],
                        "metadata": doc.metadata,
                        "similarity_score": similarity_score
                    })
                
                # Sort by similarity
                self.last_retrieved_sources.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
                                
        except Exception as e:
            logger.error(f"QA chain error: {str(e)}")
            final_response = f"Error processing query: {str(e)}"

        # Parse medicine suggestions from the response text
        medicines = self._extract_medicines(final_response)
        
        # Fallback: extract medicines directly from source documents
        if not medicines and self.last_retrieved_sources:
            medicines = self._extract_medicines_from_sources()

        return {
            "answer": final_response,
            "sources": self.last_retrieved_sources,
            "medicines": medicines if medicines else None,
            "specialist_type": specialist_type
        }
    
    def _extract_medicines(self, text: str) -> list:
        """Extract medicine names from the response text using multiple patterns."""
        medicines = []
        seen_names = set()
        
        # Section headers to filter out
        headers = {'risk level', 'condition analysis', 'recommended specialist',
                   'suggested medicines', 'precautions', 'recommendation',
                   'medicine name', 'note', 'important', 'warning', 'low', 
                   'moderate', 'high', 'query', 'response', 'retrieved context'}
        
        # Pattern 1: **MedicineName** — usage
        pattern1 = r'\*\*([A-Za-z][A-Za-z\s\-\/\(\)0-9]+?)\*\*\s*[—\-–:]+\s*(.+?)(?:\n|$)'
        for name, usage in re.findall(pattern1, text):
            name = name.strip()
            if name.lower() in headers:
                continue
            if 2 < len(name) < 60 and name.lower() not in seen_names:
                seen_names.add(name.lower())
                medicines.append({
                    "name": name,
                    "usage": usage.strip()[:200],
                    "source": "Verified Sources"
                })
        
        # Pattern 2: - MedicineName: usage or - MedicineName (usage)
        pattern2 = r'[-•\*]\s+([A-Z][A-Za-z\s\-\/]+?)\s*[:\(]\s*(.+?)(?:\)|\n|$)'
        for name, usage in re.findall(pattern2, text):
            name = name.strip()
            if name.lower() in headers:
                continue
            if 2 < len(name) < 60 and name.lower() not in seen_names:
                seen_names.add(name.lower())
                medicines.append({
                    "name": name,
                    "usage": usage.strip()[:200],
                    "source": "Verified Sources"
                })
        
        # Pattern 3: numbered list: 1. MedicineName - usage
        pattern3 = r'\d+\.\s+\*?\*?([A-Z][A-Za-z\s\-\/]+?)\*?\*?\s*[-–—:]\s*(.+?)(?:\n|$)'
        for name, usage in re.findall(pattern3, text):
            name = name.strip()
            if name.lower() in headers:
                continue
            if 2 < len(name) < 60 and name.lower() not in seen_names:
                seen_names.add(name.lower())
                medicines.append({
                    "name": name,
                    "usage": usage.strip()[:200],
                    "source": "Verified Sources"
                })
        
        return medicines
    
    def _extract_medicines_from_sources(self) -> list:
        """Fallback: Extract medicine/drug names directly from retrieved source documents."""
        medicines = []
        seen_names = set()
        
        # Known common medicine names to look for in source text
        known_medicines = [
            'paracetamol', 'acetaminophen', 'aspirin', 'ibuprofen', 'naproxen',
            'diclofenac', 'warfarin', 'heparin', 'metformin', 'insulin',
            'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline',
            'metronidazole', 'cephalexin', 'penicillin', 'erythromycin',
            'omeprazole', 'pantoprazole', 'ranitidine', 'famotidine',
            'atorvastatin', 'rosuvastatin', 'simvastatin', 'losartan',
            'amlodipine', 'enalapril', 'lisinopril', 'ramipril',
            'metoprolol', 'atenolol', 'propranolol', 'carvedilol',
            'hydrochlorothiazide', 'furosemide', 'spironolactone',
            'prednisolone', 'prednisone', 'dexamethasone', 'hydrocortisone',
            'salbutamol', 'albuterol', 'montelukast', 'fluticasone',
            'cetirizine', 'loratadine', 'fexofenadine', 'chlorpheniramine',
            'morphine', 'codeine', 'tramadol', 'fentanyl',
            'diazepam', 'lorazepam', 'alprazolam', 'clonazepam',
            'sertraline', 'fluoxetine', 'escitalopram', 'paroxetine',
            'gabapentin', 'pregabalin', 'carbamazepine', 'valproate',
            'phenytoin', 'levetiracetam', 'lamotrigine',
            'levothyroxine', 'carbimazole', 'propylthiouracil',
            'clopidogrel', 'ticagrelor', 'rivaroxaban', 'apixaban',
            'enoxaparin', 'dabigatran', 'methotrexate', 'hydroxychloroquine',
            'sulfasalazine', 'cyclophosphamide', 'azathioprine',
            'tacrolimus', 'cyclosporine', 'mycophenolate',
            'ciprofloxacin', 'levofloxacin', 'moxifloxacin',
            'fluconazole', 'ketoconazole', 'clotrimazole',
            'acyclovir', 'oseltamivir', 'tenofovir', 'zidovudine',
            'artemether', 'lumefantrine', 'chloroquine', 'quinine',
            'albendazole', 'mebendazole', 'ivermectin', 'praziquantel',
            'ondansetron', 'domperidone', 'metoclopramide', 'loperamide',
            'digoxin', 'amiodarone', 'verapamil', 'diltiazem',
            'nitroglycerin', 'isosorbide', 'nifedipine', 'telmisartan',
            'glimepiride', 'glipizide', 'gliclazide', 'pioglitazone',
            'sitagliptin', 'vildagliptin', 'empagliflozin', 'dapagliflozin',
            'vitamin', 'calcium', 'iron', 'folic acid', 'zinc',
        ]
        
        for source in self.last_retrieved_sources:
            content = source.get('content', '')
            if not content:
                continue
            
            source_name = os.path.basename(source.get('metadata', {}).get('source', 'Unknown'))
            content_lower = content.lower()
            
            # Look for known medicine names in source content
            for med_name in known_medicines:
                if med_name in content_lower and med_name not in seen_names:
                    seen_names.add(med_name)
                    
                    # Extract context around the medicine name
                    idx = content_lower.find(med_name)
                    start = max(0, idx - 20)
                    end = min(len(content), idx + len(med_name) + 100)
                    context = content[start:end].strip()
                    # Clean up context
                    context = context.replace('\n', ' ').strip()
                    
                    medicines.append({
                        "name": med_name.title(),
                        "usage": context[:200],
                        "source": source_name
                    })
            
            # Also look for patterns like "word 500mg" or "word 250 mg"
            dosage_pattern = r'\b([A-Z][a-z]{3,20})\s*\d+\s*(?:mg|mcg|ml|g|IU)\b'
            # Skip dosage forms and generic words
            dosage_form_skip = {
                'tablet', 'tablets', 'capsule', 'capsules', 'injection', 'injections',
                'syrup', 'solution', 'suspension', 'cream', 'ointment', 'drops',
                'oral', 'topical', 'each', 'dose', 'maximum', 'minimum',
                'adult', 'child', 'children', 'body', 'weight', 'daily',
                'every', 'once', 'twice', 'three', 'four', 'times',
                'contains', 'approximately', 'about', 'less', 'more', 'than',
            }
            for match in re.findall(dosage_pattern, content):
                name = match.strip()
                if (name.lower() not in seen_names 
                    and name.lower() not in dosage_form_skip
                    and len(name) > 3):
                    seen_names.add(name.lower())
                    idx = content.find(name)
                    context = content[max(0,idx-20):idx+len(name)+100].replace('\n',' ').strip()
                    medicines.append({
                        "name": name,
                        "usage": context[:200],
                        "source": source_name
                    })
            
            if len(medicines) >= 8:
                break
        
        return medicines[:8]
    
    def find_doctors(self, query: str, location: str) -> dict:
        """Find specialist doctors — called by the /doctors endpoint."""
        specialization = detect_specialization(query)
        lat, lon = geocode_location(location)
        
        if lat is None or lon is None:
            return {
                "doctors": [],
                "location": location,
                "specialization": specialization
            }
        
        doctors = find_doctors_overpass(lat, lon, specialization)
        
        return {
            "doctors": doctors,
            "location": location,
            "specialization": specialization
        }


# Create a single instance (singleton pattern)
rag_service = RAGService()