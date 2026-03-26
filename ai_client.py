import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional
from config import GROQ_API_KEY, OLLAMA_BASE_URL, USE_GROQ, USE_OLLAMA, GROQ_MODELS, OLLAMA_MODELS

class FreeAIClient:
    def __init__(self):
        self.session = None
        self.use_groq = USE_GROQ
        self.use_ollama = USE_OLLAMA
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def call_groq(self, model: str, messages: list, max_tokens: int = 1000) -> Dict[str, Any]:
        """Call Groq API (free tier)"""
        if not self.use_groq:
            raise ValueError("Groq API key not configured")
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
        
        async with self.session.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"Groq API error: {response.status} - {error_text}")
            
            result = await response.json()
            return {
                "content": result["choices"][0]["message"]["content"],
                "usage": result.get("usage", {})
            }
    
    async def call_ollama(self, model: str, messages: list, max_tokens: int = 1000) -> Dict[str, Any]:
        """Call Ollama (local, free)"""
        if not self.use_ollama:
            raise ValueError("Ollama not available")
        
        # Convert OpenAI format to Ollama format
        prompt = ""
        for msg in messages:
            if msg["role"] == "system":
                prompt += f"System: {msg['content']}\n"
            elif msg["role"] == "user":
                prompt += f"User: {msg['content']}\n"
            elif msg["role"] == "assistant":
                prompt += f"Assistant: {msg['content']}\n"
        
        prompt += "Assistant: "
        
        data = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7
            }
        }
        
        async with self.session.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=data
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"Ollama error: {response.status} - {error_text}")
            
            result = await response.json()
            return {
                "content": result["response"],
                "usage": result.get("usage", {})
            }
    
    async def call_model(self, model_type: str, messages: list, max_tokens: int = 1000) -> Dict[str, Any]:
        """Unified method to call the best available model"""
        try:
            if self.use_groq:
                model = GROQ_MODELS.get(model_type, GROQ_MODELS["gpt-3.5-turbo"])
                return await self.call_groq(model, messages, max_tokens)
            elif self.use_ollama:
                model = OLLAMA_MODELS.get(model_type, OLLAMA_MODELS["gpt-3.5-turbo"])
                return await self.call_ollama(model, messages, max_tokens)
            else:
                raise ValueError("No AI service available")
        except Exception as e:
            # Fallback to local response if all APIs fail
            return {
                "content": f"AI service unavailable: {str(e)}. Please check your API configuration.",
                "usage": {}
            }

async def call_ai(model_type: str, system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> str:
    """Convenience function to call AI with system and user prompts"""
    async with FreeAIClient() as client:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        result = await client.call_model(model_type, messages, max_tokens)
        return result["content"]
