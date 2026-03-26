from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
from agents import ContentAgents
from brand_ingestion import ingest_brand_guidelines

app = FastAPI(title="SocialAI - Content Intelligence API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for requests
class DraftRequest(BaseModel):
    topic: str
    audience: str
    tone: str = "professional"
    brand_guidelines: str = ""

class ComplianceRequest(BaseModel):
    content: str
    brand_guidelines: str = ""

class LocalizeRequest(BaseModel):
    content: str
    target_locale: str
    target_region: str = ""

class DistributeRequest(BaseModel):
    content: str
    channel: str

class InsightsRequest(BaseModel):
    engagement_data: List[Dict[str, Any]]

class StrategyRequest(BaseModel):
    insight: Dict[str, Any]

class KeywordsRequest(BaseModel):
    source_text: str

class KnowledgeToContentRequest(BaseModel):
    source_text: str
    target_audience: str
    target_format: str

class BrandIngestionRequest(BaseModel):
    url: str

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# API Endpoints

@app.get("/")
async def root():
    return {"message": "SocialAI Content Intelligence API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SocialAI API"}

# Concept 1: Live Agent Orchestration Graph
@app.post("/draft")
async def draft_content(request: DraftRequest):
    """Create initial content from a brief"""
    try:
        result = await ContentAgents.drafting_agent(
            request.topic, 
            request.audience, 
            request.tone, 
            request.brand_guidelines
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compliance")
async def check_compliance(request: ComplianceRequest):
    """Check content against brand guidelines"""
    try:
        result = await ContentAgents.compliance_agent(
            request.content, 
            request.brand_guidelines
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/localize")
async def localize_content(request: LocalizeRequest):
    """Adapt content to target market"""
    try:
        result = await ContentAgents.localization_agent(
            request.content, 
            request.target_locale, 
            request.target_region
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/distribute")
async def distribute_content(request: DistributeRequest):
    """Adapt content for specific channels"""
    try:
        result = await ContentAgents.distribution_agent(
            request.content, 
            request.channel
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Concept 2: Content Intelligence & Strategy Dashboard
@app.post("/insights")
async def get_insights(request: InsightsRequest):
    """Analyze engagement data and return trends/patterns"""
    try:
        result = await ContentAgents.insight_agent(request.engagement_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategy")
async def get_strategy(request: StrategyRequest):
    """Generate autonomous actions from insights"""
    try:
        result = await ContentAgents.strategy_agent(request.insight)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/governance")
async def governance_check(request: ComplianceRequest):
    """Real-time brand monitoring"""
    try:
        result = await ContentAgents.governance_agent(
            request.content, 
            request.brand_guidelines
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Concept 3: Knowledge-to-Content Transformation Viewer
@app.post("/extract-keywords")
async def extract_keywords(request: KeywordsRequest):
    """Extract key entities from source document"""
    try:
        result = await ContentAgents.keyword_extractor(request.source_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge-to-content")
async def transform_knowledge_to_content(request: KnowledgeToContentRequest):
    """Transform source text into audience-specific asset"""
    try:
        result = await ContentAgents.knowledge_to_content_agent(
            request.source_text, 
            request.target_audience, 
            request.target_format
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/format-for-channel")
async def format_for_channel(request: DistributeRequest):
    """Adapt content to different channels"""
    try:
        result = await ContentAgents.channel_formatter(
            request.content, 
            request.channel
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Brand Guidelines Ingestion
@app.post("/ingest-brand-guidelines")
async def ingest_brand(request: BrandIngestionRequest):
    """Ingest brand guidelines from company URL"""
    try:
        result = await ingest_brand_guidelines(request.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or process real-time requests
            await manager.send_personal_message(f"Received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Live orchestration workflow
@app.post("/orchestrate-workflow")
async def orchestrate_workflow(request: DraftRequest):
    """Run the complete content creation workflow"""
    try:
        # Step 1: Draft content
        draft_result = await ContentAgents.drafting_agent(
            request.topic, 
            request.audience, 
            request.tone, 
            request.brand_guidelines
        )
        
        if not draft_result["success"]:
            return {"success": False, "error": "Drafting failed", "step": "draft"}
        
        # Step 2: Check compliance
        compliance_result = await ContentAgents.compliance_agent(
            draft_result["content"], 
            request.brand_guidelines
        )
        
        # Broadcast progress via WebSocket
        await manager.broadcast(json.dumps({
            "step": "draft_completed",
            "content": draft_result["content"]
        }))
        
        await manager.broadcast(json.dumps({
            "step": "compliance_completed",
            "result": compliance_result
        }))
        
        return {
            "success": True,
            "workflow": {
                "draft": draft_result,
                "compliance": compliance_result
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
