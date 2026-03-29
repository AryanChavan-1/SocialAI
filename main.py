import os
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import uuid
import socketio
from agents import ContentAgents, IntelligenceAgents, KnowledgeAgents
from brand_ingestion import ingest_brand_guidelines
from database import SessionLocal, Workflow, WorkflowStep, ActivityLog, Campaign, engine, Base, User
from auth import (
    authenticate_user, create_user, create_access_token, 
    get_user_by_email, get_user_by_username, ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta

# ─── Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("socialai")

# ─── App Init ───────────────────────────────────────────────────────
app = FastAPI(title="SocialAI - Content Intelligence API", version="2.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# In-memory cache for active workflows (mirrors DB for speed)
workflows_db: Dict[str, Any] = {}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic models ───────────────────────────────────────────────
class DraftRequest(BaseModel):
    topic: str
    audience: str
    tone: str = "professional"
    brand_guidelines: str = ""

# ─── Auth Models ────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str

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

# ─── Socket.io events ──────────────────────────────────────────────
@sio.event
async def connect(sid, environ, auth):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

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
    _persist_workflow_status(workflow_id, 'approved')
    await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'approved'}, room=workflow['room_id'])
    asyncio.create_task(resume_workflow_pipeline(workflow_id))

# ─── DB Helpers ─────────────────────────────────────────────────────
def _persist_workflow_status(workflow_id: str, status: str):
    db = SessionLocal()
    try:
        wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if wf:
            wf.status = status
            db.commit()
    finally:
        db.close()

def _persist_step(workflow_id: str, step_name: str, result: dict):
    db = SessionLocal()
    try:
        step = WorkflowStep(workflow_id=workflow_id, step_name=step_name, result=result)
        db.add(step)
        db.commit()
    finally:
        db.close()

def _log_activity(level: str, message: str):
    db = SessionLocal()
    try:
        log = ActivityLog(level=level, message=message)
        db.add(log)
        db.commit()
    finally:
        db.close()

# ─── API Endpoints ──────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "SocialAI Content Intelligence API", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SocialAI API"}

# --- Content Pipeline Endpoints ---
@app.post("/draft")
async def draft_content(request: DraftRequest):
    try:
        result = await ContentAgents.drafting_agent(request.topic, request.audience, request.tone, request.brand_guidelines)
        _log_activity("info", f"Draft generated for topic: {request.topic}")
        return result
    except Exception as e:
        logger.error(f"Draft failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compliance")
async def check_compliance(request: ComplianceRequest):
    try:
        result = await ContentAgents.compliance_agent(request.content, request.brand_guidelines)
        return result
    except Exception as e:
        logger.error(f"Compliance check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/localize")
async def localize_content(request: LocalizeRequest):
    try:
        result = await ContentAgents.localization_agent(request.content, request.target_locale, request.target_region)
        return result
    except Exception as e:
        logger.error(f"Localization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/distribute")
async def distribute_content(request: DistributeRequest):
    try:
        result = await ContentAgents.distribution_agent(request.content, request.channel)
        return result
    except Exception as e:
        logger.error(f"Distribution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Intelligence Endpoints ---
@app.post("/insights")
async def get_insights(request: InsightsRequest):
    try:
        result = await IntelligenceAgents.insight_agent(request.engagement_data)
        _log_activity("info", f"Generated {len(result.get('insights', []))} insights")
        return result
    except Exception as e:
        logger.error(f"Insights failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/strategy")
async def get_strategy(request: StrategyRequest):
    try:
        result = await IntelligenceAgents.strategy_agent(request.insight, "current")
        return result
    except Exception as e:
        logger.error(f"Strategy failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/governance")
async def governance_check(request: ComplianceRequest):
    try:
        result = await ContentAgents.compliance_agent(request.content, request.brand_guidelines)
        return result
    except Exception as e:
        logger.error(f"Governance check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Knowledge Transformation Endpoints ---
@app.post("/extract-keywords")
async def extract_keywords(request: KeywordsRequest):
    try:
        result = await KnowledgeAgents.keyword_extractor(request.source_text)
        return result
    except Exception as e:
        logger.error(f"Keyword extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge-to-content")
async def transform_knowledge_to_content(request: KnowledgeToContentRequest):
    try:
        result = await KnowledgeAgents.knowledge_to_content_agent(request.source_text, request.target_audience, request.target_format)
        return result
    except Exception as e:
        logger.error(f"Knowledge transform failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/format-for-channel")
async def format_for_channel(request: DistributeRequest):
    try:
        result = await ContentAgents.distribution_agent(request.content, request.channel)
        return result
    except Exception as e:
        logger.error(f"Channel formatting failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Brand Guidelines ---
@app.post("/ingest-brand-guidelines")
async def ingest_brand(request: BrandIngestionRequest):
    try:
        result = await ingest_brand_guidelines(request.url)
        return result
    except Exception as e:
        logger.error(f"Brand ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Orchestration Pipeline ────────────────────────────────────────
async def run_workflow_pipeline(workflow_id: str):
    workflow = workflows_db[workflow_id]
    request_data = workflow['initial_request']
    room_id = workflow['room_id']
    
    try:
        # Step 1: Draft
        workflow['status'] = 'drafting'
        _persist_workflow_status(workflow_id, 'drafting')
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'drafting'}, room=room_id)
        
        draft_result = await ContentAgents.drafting_agent(
            request_data['topic'], request_data['audience'],
            request_data['tone'], request_data['brand_guidelines']
        )
        
        if not draft_result.get("success"):
            workflow['status'] = 'failed'
            _persist_workflow_status(workflow_id, 'failed')
            await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': 'Drafting failed'}, room=room_id)
            return

        workflow['content'] = draft_result['content']
        _persist_step(workflow_id, 'draft', draft_result)
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'draft', 'result': draft_result}, room=room_id)
        
        # Step 2: Compliance
        workflow['status'] = 'checking_compliance'
        _persist_workflow_status(workflow_id, 'checking_compliance')
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'checking_compliance'}, room=room_id)
        
        compliance_result = await ContentAgents.compliance_agent(workflow['content'], request_data['brand_guidelines'])
        _persist_step(workflow_id, 'compliance', compliance_result)
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'compliance', 'result': compliance_result}, room=room_id)
        
        # Pause for Human Approval
        workflow['status'] = 'pending_approval'
        _persist_workflow_status(workflow_id, 'pending_approval')
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'pending_approval'}, room=room_id)
        
    except Exception as e:
        logger.error(f"Workflow pipeline error: {e}")
        workflow['status'] = 'failed'
        _persist_workflow_status(workflow_id, 'failed')
        await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': str(e)}, room=room_id)


async def resume_workflow_pipeline(workflow_id: str):
    workflow = workflows_db[workflow_id]
    room_id = workflow['room_id']
    content = workflow.get('content', '')
    
    try:
        # Step 3: Localization
        workflow['status'] = 'localizing'
        _persist_workflow_status(workflow_id, 'localizing')
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'localizing'}, room=room_id)
        
        local_result = await ContentAgents.localization_agent(content, "en", "US")
        _persist_step(workflow_id, 'localization', local_result)
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'localization', 'result': local_result}, room=room_id)
        
        # Step 4: Distribution
        workflow['status'] = 'distributing'
        _persist_workflow_status(workflow_id, 'distributing')
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'distributing'}, room=room_id)
        
        dist_result = await ContentAgents.distribution_agent(local_result.get('content', content), "LinkedIn")
        _persist_step(workflow_id, 'distribution', dist_result)
        await sio.emit('step_completed', {'workflow_id': workflow_id, 'step': 'distribution', 'result': dist_result}, room=room_id)
        
        workflow['status'] = 'completed'
        _persist_workflow_status(workflow_id, 'completed')
        _log_activity("info", f"Workflow {workflow_id[:8]} completed successfully")
        await sio.emit('workflow_update', {'workflow_id': workflow_id, 'status': 'completed'}, room=room_id)
        
    except Exception as e:
        logger.error(f"Resume pipeline error: {e}")
        workflow['status'] = 'failed'
        _persist_workflow_status(workflow_id, 'failed')
        await sio.emit('workflow_error', {'workflow_id': workflow_id, 'error': str(e)}, room=room_id)


@app.post("/orchestrate-workflow")
async def orchestrate_workflow(request: DraftRequest, background_tasks: BackgroundTasks):
    """Start the complete content creation workflow"""
    workflow_id = str(uuid.uuid4())
    
    # Persist to DB
    db = SessionLocal()
    try:
        wf = Workflow(id=workflow_id, topic=request.topic, audience=request.audience, tone=request.tone, status="initialized")
        db.add(wf)
        db.commit()
    finally:
        db.close()
    
    workflows_db[workflow_id] = {
        'id': workflow_id,
        'status': 'initialized',
        'initial_request': request.model_dump(),
        'room_id': f"room_{workflow_id}"
    }
    
    _log_activity("info", f"Workflow {workflow_id[:8]} initiated for topic: {request.topic}")
    background_tasks.add_task(run_workflow_pipeline, workflow_id)
    
    return {
        "success": True,
        "workflow_id": workflow_id,
        "message": "Workflow started. Connect via Socket.io and join room_id to receive updates.",
        "room_id": workflows_db[workflow_id]['room_id']
    }


# ─── Authentication Endpoints ──────────────────────────────────────
@app.post("/auth/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    db = SessionLocal()
    try:
        # Check if email already exists
        if get_user_by_email(db, request.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check if username already exists
        if get_user_by_username(db, request.username):
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create user
        user = create_user(db, request.email, request.username, request.password)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "id": user.id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        )
    finally:
        db.close()

@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login user and return access token"""
    db = SessionLocal()
    try:
        user = authenticate_user(db, request.email, request.password)
        if not user:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        access_token = create_access_token(
            data={"sub": user.email, "id": user.id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        )
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting SocialAI API on port 8001...")
    uvicorn.run(socket_app, host="0.0.0.0", port=8001)
