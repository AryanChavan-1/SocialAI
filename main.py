from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import uuid
import socketio
from agents import ContentAgents
from brand_ingestion import ingest_brand_guidelines

app = FastAPI(title="SocialAI - Content Intelligence API", version="1.0.0")
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

workflows_db: Dict[str, Any] = {}

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

@sio.event
async def connect(sid, environ, auth):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.on('join_workflow')
async def handle_join(sid, data):
    workflow_id = data.get('workflow_id')
    if workflow_id:
        room = f"room_{workflow_id}"
        await sio.enter_room(sid, room)
        await sio.emit('joined', {'room': room}, room=sid)

@sio.on('approve_content')
async def handle_approval(sid, data):
    workflow_id = data.get('workflow_id')
    if not workflow_id or workflow_id not in workflows_db:
        await sio.emit('error', {'message': 'Invalid workflow ID'}, room=sid)
        return
        
    workflow = workflows_db[workflow_id]
    if workflow['status'] != 'pending_approval':
        await sio.emit('error', {'message': 'Workflow not awaiting approval'}, room=sid)
        return
        
    workflow['status'] = 'approved'
    await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'approved'}, room=workflow['room_id'])
    
    asyncio.create_task(resume_workflow_pipeline(workflow_id))

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

async def run_workflow_pipeline(workflow_id: str):
    workflow = workflows_db[workflow_id]
    request_data = workflow['initial_request']
    room_id = workflow['room_id']
    
    try:
        # Step 1: Draft
        workflow['status'] = 'drafting'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'drafting'}, room=room_id)
        
        draft_result = await ContentAgents.drafting_agent(
            request_data['topic'], 
            request_data['audience'], 
            request_data['tone'], 
            request_data['brand_guidelines']
        )
        
        if not draft_result["success"]:
            workflow['status'] = 'failed'
            await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': 'Drafting failed'}, room=room_id)
            return

        workflow['content'] = draft_result['content']
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'draft', 'result': draft_result}, room=room_id)
        
        # Step 2: Compliance
        workflow['status'] = 'checking_compliance'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'checking_compliance'}, room=room_id)
        
        compliance_result = await ContentAgents.compliance_agent(
            workflow['content'], 
            request_data['brand_guidelines']
        )
        
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'compliance', 'result': compliance_result}, room=room_id)
        
        # Pause for Human Approval
        workflow['status'] = 'pending_approval'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'pending_approval'}, room=room_id)
        
    except Exception as e:
        workflow['status'] = 'failed'
        await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': str(e)}, room=room_id)


async def resume_workflow_pipeline(workflow_id: str):
    workflow = workflows_db[workflow_id]
    room_id = workflow['room_id']
    content = workflow.get('content', '')
    
    try:
        # Step 3: Localization (Default to es and Spain for demonstration)
        workflow['status'] = 'localizing'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'localizing'}, room=room_id)
        
        local_result = await ContentAgents.localization_agent(content, "es", "Spain")
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'localization', 'result': local_result}, room=room_id)
        
        # Step 4: Distribution (Default to LinkedIn)
        workflow['status'] = 'distributing'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'distributing'}, room=room_id)
        
        dist_result = await ContentAgents.distribution_agent(local_result['content'], "LinkedIn")
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'distribution', 'result': dist_result}, room=room_id)
        
        workflow['status'] = 'completed'
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'completed'}, room=room_id)
        
    except Exception as e:
        workflow['status'] = 'failed'
        await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': str(e)}, room=room_id)


# Live orchestration workflow
@app.post("/orchestrate-workflow")
async def orchestrate_workflow(request: DraftRequest, background_tasks: BackgroundTasks):
    """Start the complete content creation workflow"""
    workflow_id = str(uuid.uuid4())
    
    workflows_db[workflow_id] = {
        'id': workflow_id,
        'status': 'initialized',
        'initial_request': request.model_dump(),
        'room_id': f"room_{workflow_id}"
    }
    
    background_tasks.add_task(run_workflow_pipeline, workflow_id)
    
    return {
        "success": True,
        "workflow_id": workflow_id,
        "message": "Workflow started. Connect via Socket.io and join room_id to receive updates.",
        "room_id": workflows_db[workflow_id]['room_id']
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8001)
