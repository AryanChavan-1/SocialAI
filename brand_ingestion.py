import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from urllib.parse import urljoin, urlparse
from ai_client import call_ai

class BrandGuidelinesIngestion:
    """Ingests company URL and extracts brand guidelines"""
    
    def __init__(self):
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_page(self, url: str) -> str:
        """Scrape text content from a URL"""
        try:
            async with self.session.get(url, timeout=10) as response:
                if response.status != 200:
                    return ""
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                return text[:5000]  # Limit to 5000 chars per page
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return ""
    
    async def get_company_pages(self, base_url: str) -> List[str]:
        """Get important pages from company website"""
        pages = [base_url]
        
        try:
            # Try to find common pages
            common_paths = ['/about', '/about-us', '/company', '/team', '/blog', '/products', '/services']
            base_domain = f"{urlparse(base_url).scheme}://{urlparse(base_url).netloc}"
            
            for path in common_paths:
                full_url = urljoin(base_domain, path)
                pages.append(full_url)
            
            return pages[:5]  # Limit to 5 pages to avoid overloading
        except Exception:
            return pages
    
    def chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """Split text into chunks for processing"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks
    
    async def extract_brand_voice(self, text_chunks: List[str]) -> Dict[str, Any]:
        """Extract brand voice attributes from text chunks"""
        # Combine chunks for analysis (limit to prevent token overflow)
        combined_text = ' '.join(text_chunks[:3])  # Use first 3 chunks
        
        system_prompt = """You are a brand analyst. Extract brand voice attributes from company text.
Return structured JSON only."""
        
        user_prompt = f"""Analyze the following text and extract brand voice attributes. Return a structured JSON with:
- "tone": (formal/casual/professional/friendly/technical)
- "key_terminology": array of important terms the company uses
- "prohibited_phrases": array of terms to avoid (if any mentioned)
- "target_audience": description of target audience
- "values": array of company values mentioned
- "messaging_style": description of communication style

Text: {combined_text}

Return only valid JSON."""
        
        try:
            response = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=600)
            
            try:
                brand_attributes = json.loads(response)
            except json.JSONDecodeError:
                # Fallback brand attributes
                brand_attributes = {
                    "tone": "professional",
                    "key_terminology": [],
                    "prohibited_phrases": [],
                    "target_audience": "general",
                    "values": [],
                    "messaging_style": "professional and informative"
                }
            
            return brand_attributes
        except Exception as e:
            print(f"Error extracting brand voice: {e}")
            return {
                "tone": "professional",
                "key_terminology": [],
                "prohibited_phrases": [],
                "target_audience": "general",
                "values": [],
                "messaging_style": "professional and informative"
            }
    
    async def ingest_from_url(self, url: str) -> Dict[str, Any]:
        """Main method to ingest brand guidelines from URL"""
        try:
            # Get pages to scrape
            pages = await self.get_company_pages(url)
            
            # Scrape all pages
            all_text = ""
            for page in pages:
                text = await self.scrape_page(page)
                all_text += text + "\n\n"
            
            if not all_text.strip():
                return {
                    "success": False,
                    "error": "Could not extract content from the URL",
                    "guidelines": {}
                }
            
            # Chunk the text
            chunks = self.chunk_text(all_text)
            
            # Extract brand voice
            brand_attributes = await self.extract_brand_voice(chunks)
            
            # Create comprehensive guidelines
            guidelines = {
                "source_url": url,
                "scraped_pages": pages,
                "brand_voice": brand_attributes,
                "content_guidelines": {
                    "tone": brand_attributes.get("tone", "professional"),
                    "target_audience": brand_attributes.get("target_audience", "general"),
                    "key_terminology": brand_attributes.get("key_terminology", []),
                    "avoid_terms": brand_attributes.get("prohibited_phrases", []),
                    "values": brand_attributes.get("values", []),
                    "style": brand_attributes.get("messaging_style", "professional")
                },
                "compliance_rules": [
                    f"Maintain {brand_attributes.get('tone', 'professional')} tone",
                    f"Target {brand_attributes.get('target_audience', 'general')} audience",
                    "Use company's key terminology consistently",
                    "Avoid prohibited phrases",
                    "Reflect company values in messaging"
                ]
            }
            
            return {
                "success": True,
                "guidelines": guidelines,
                "raw_text_length": len(all_text),
                "pages_scraped": len([p for p in pages if p])
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "guidelines": {}
            }

async def ingest_brand_guidelines(url: str) -> Dict[str, Any]:
    """Convenience function to ingest brand guidelines from URL"""
    async with BrandGuidelinesIngestion() as ingestion:
        return await ingestion.ingest_from_url(url)
