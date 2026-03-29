import os
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env")  # Fallback

# Free API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

# Model mappings for free APIs
GROQ_MODELS = {
    "gpt-4": "llama-3.1-70b-versatile",  # Groq's equivalent to GPT-4
    "gpt-3.5-turbo": "llama-3.1-8b-instant",  # Groq's equivalent to GPT-3.5
    "fast": "llama-3.1-8b-instant"  # Fast model for simple tasks
}

OLLAMA_MODELS = {
    "gpt-4": "llama3:70b",
    "gpt-3.5-turbo": "llama3:8b",
    "fast": "gemma:7b"
}

# Choose primary API (Groq preferred for speed, Ollama as fallback)
USE_GROQ = bool(GROQ_API_KEY)
USE_OLLAMA = True  # Always available if Ollama is running
