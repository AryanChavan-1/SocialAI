import logging
import asyncio
from typing import Dict, Any, Optional
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API error class"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

def safe_json_parse(json_str: str, default: Any = None) -> Any:
    """Safely parse JSON with fallback"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default

def validate_content_length(content: str, max_length: int = 10000) -> bool:
    """Validate content length"""
    return len(content) <= max_length

def sanitize_text(text: str) -> str:
    """Basic text sanitization"""
    if not text:
        return ""
    # Remove potentially harmful characters
    dangerous_chars = ['<', '>', '&', '"', "'", '\\']
    for char in dangerous_chars:
        text = text.replace(char, '')
    return text.strip()

async def retry_on_failure(func, max_retries: int = 3, delay: float = 1.0):
    """Retry mechanism for API calls"""
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
            await asyncio.sleep(delay * (attempt + 1))  # Exponential backoff

def format_error_response(error: Exception, context: str = "") -> Dict[str, Any]:
    """Format consistent error responses"""
    return {
        "success": False,
        "error": str(error),
        "context": context,
        "error_type": type(error).__name__
    }

def log_api_call(endpoint: str, request_data: Dict[str, Any], response_data: Dict[str, Any]):
    """Log API calls for monitoring"""
    logger.info(f"API Call - Endpoint: {endpoint}")
    logger.info(f"Request: {json.dumps(request_data, default=str)[:200]}...")
    logger.info(f"Response: {json.dumps(response_data, default=str)[:200]}...")

class RateLimiter:
    """Simple rate limiter"""
    def __init__(self, max_calls: int = 10, time_window: int = 60):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    async def acquire(self):
        """Check if call is allowed"""
        import time
        current_time = time.time()
        
        # Remove old calls
        self.calls = [call_time for call_time in self.calls if current_time - call_time < self.time_window]
        
        if len(self.calls) >= self.max_calls:
            raise APIError("Rate limit exceeded", status_code=429)
        
        self.calls.append(current_time)

# Global rate limiter instance
rate_limiter = RateLimiter()

async def check_rate_limit():
    """Check rate limit before processing"""
    await rate_limiter.acquire()
