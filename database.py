from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(String, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    audience = Column(String, nullable=False)
    tone = Column(String, nullable=False)
    status = Column(String, default="idle")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to store each step's result as a JSON dump
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    step_name = Column(String, nullable=False)
    result = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    workflow = relationship("Workflow", back_populates="steps")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String, default="info")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Insight(Base):
    __tablename__ = "insights"
    id = Column(Integer, primary_key=True, index=True)
    pattern = Column(String, nullable=False)
    confidence = Column(String, nullable=False)
    suggested_action = Column(String, nullable=False)

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    content_payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
