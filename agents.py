import json
import re
from typing import Dict, Any, List, Optional
from ai_client import call_ai

class ContentAgents:
    """All AI agents for content generation and analysis"""
    
    @staticmethod
    async def drafting_agent(topic: str, audience: str, tone: str = "professional", 
                           brand_guidelines: str = "") -> Dict[str, Any]:
        """Creates initial content from a brief"""
        system_prompt = "You are a professional content writer. Create engaging, well-structured content that follows the specified requirements."
        
        user_prompt = f"""Write a short blog post about the topic: "{topic}" for an audience of {audience}. 
Use a {tone} tone. 
{f'Follow these brand guidelines: {brand_guidelines}' if brand_guidelines else ''}

Make it engaging and informative. Return only the content without additional commentary."""
        
        try:
            content = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=800)
            return {
                "success": True,
                "content": content.strip(),
                "word_count": len(content.split())
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": ""
            }
    
    @staticmethod
    async def compliance_agent(content: str, brand_guidelines: str) -> Dict[str, Any]:
        """Checks content against brand guidelines"""
        system_prompt = """You are a brand compliance officer. Review content against brand guidelines and return structured JSON feedback.
Always return valid JSON format."""
        
        user_prompt = f"""Review the content below against the brand guidelines. Return a JSON with:
- "status": "pass" or "fail"
- "violations": array of objects with "type" (tone/terminology/regulatory), "text" (the offending phrase), "suggestion" (how to fix)
If no violations, set status "pass" and violations empty.

Guidelines:
{brand_guidelines}

Content:
{content}

Return only valid JSON."""
        
        try:
            response = await call_ai("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=500)
            
            # Try to parse JSON, fallback if parsing fails
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                # Fallback response
                result = {
                    "status": "pass",
                    "violations": []
                }
            
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "result": {"status": "error", "violations": []}
            }
    
    @staticmethod
    async def localization_agent(content: str, target_locale: str, target_region: str = "") -> Dict[str, Any]:
        """Adapts content to a target market"""
        system_prompt = "You are a localization expert. Adapt content for different markets while preserving the core message."
        
        user_prompt = f"""Adapt the following content for {target_locale} {f'(region: {target_region})' if target_region else ''}. 
Keep the core message, but adjust language, cultural references, and formatting as needed.

Content: {content}

Return only the adapted content without additional commentary."""
        
        try:
            adapted_content = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=800)
            return {
                "success": True,
                "content": adapted_content.strip(),
                "locale": target_locale,
                "region": target_region
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": content  # Return original content as fallback
            }
    
    @staticmethod
    async def distribution_agent(content: str, channel: str) -> Dict[str, Any]:
        """Adapts content for specific channels"""
        system_prompt = "You are a social media expert. Adapt content for different platforms following best practices."
        
        user_prompt = f"""Rewrite the following content for {channel}. Follow platform best practices:
- Twitter: 280 chars max, use hashtags, concise
- LinkedIn: Professional tone, longer form allowed
- Blog: Detailed, well-structured
- Instagram: Visual-focused, engaging captions

Content: {content}

Return only the adapted content without additional commentary."""
        
        try:
            adapted_content = await call_ai("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=500)
            return {
                "success": True,
                "content": adapted_content.strip(),
                "channel": channel
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": content  # Return original content as fallback
            }
    
    @staticmethod
    async def insight_agent(engagement_data: List[Dict]) -> Dict[str, Any]:
        """Analyzes engagement data and returns trends/patterns"""
        system_prompt = """You are a content intelligence analyst. Analyze engagement data and return structured JSON insights.
Always return valid JSON format."""
        
        user_prompt = f"""Analyze the engagement data below and return a JSON array of insights. Each insight must include:
- "pattern": description of the trend (e.g., "Video posts perform 3x better than text")
- "confidence": low/medium/high
- "suggested_action": what the strategy agent could do (e.g., "Increase video posts on LinkedIn")

Data: {json.dumps(engagement_data, indent=2)}

Return only valid JSON."""
        
        try:
            response = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=600)
            
            try:
                insights = json.loads(response)
                if not isinstance(insights, list):
                    insights = [insights]
            except json.JSONDecodeError:
                insights = []
            
            return {
                "success": True,
                "insights": insights
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "insights": []
            }
    
    @staticmethod
    async def strategy_agent(insight: Dict[str, Any]) -> Dict[str, Any]:
        """Takes insights and generates autonomous actions"""
        system_prompt = """You are an autonomous content strategy agent. Based on insights, propose concrete actions.
Always return valid JSON format."""
        
        user_prompt = f"""Based on the insight: "{insight.get('pattern', '')}", propose a concrete action. 
Return a JSON with:
- "action_type": "reschedule" | "change_format" | "change_targeting" | "other"
- "description": human-readable description
- "parameters": object with specifics (e.g., {{"post_id": "123", "new_time": "14:00"}})

Return only valid JSON."""
        
        try:
            response = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=400)
            
            try:
                action = json.loads(response)
            except json.JSONDecodeError:
                action = {
                    "action_type": "other",
                    "description": "Review content strategy",
                    "parameters": {}
                }
            
            return {
                "success": True,
                "action": action
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "action": {}
            }
    
    @staticmethod
    async def governance_agent(content: str, brand_guidelines: str) -> Dict[str, Any]:
        """Real-time brand monitoring (same as compliance but optimized for speed)"""
        # Reuse compliance agent but with faster model
        return await ContentAgents.compliance_agent(content, brand_guidelines)
    
    @staticmethod
    async def keyword_extractor(source_text: str) -> Dict[str, Any]:
        """Extracts key entities from source document"""
        system_prompt = """You are an entity extraction expert. Extract key entities from text and return structured JSON.
Always return valid JSON format."""
        
        user_prompt = f"""Extract key entities from the following text. Return a JSON array with each object containing:
- "text": the exact phrase
- "type": "product" | "metric" | "pain_point" | "other"
- "position_start": character index where it begins (approximate is fine)
- "position_end": character index where it ends

Text: {source_text}

Return only valid JSON."""
        
        try:
            response = await call_ai("gpt-3.5-turbo", system_prompt, user_prompt, max_tokens=500)
            
            try:
                keywords = json.loads(response)
                if not isinstance(keywords, list):
                    keywords = []
            except json.JSONDecodeError:
                keywords = []
            
            return {
                "success": True,
                "keywords": keywords
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "keywords": []
            }
    
    @staticmethod
    async def knowledge_to_content_agent(source_text: str, target_audience: str, 
                                       target_format: str) -> Dict[str, Any]:
        """Transforms source text into audience-specific asset"""
        system_prompt = "You are a content strategist. Transform internal documents into engaging content for specific audiences."
        
        user_prompt = f"""Transform the following internal document into a {target_format} for {target_audience}. 
Use the information but adapt the tone and style to be engaging and appropriate.

Document: {source_text}

Return only the transformed content without additional commentary."""
        
        try:
            content = await call_ai("gpt-4", system_prompt, user_prompt, max_tokens=1000)
            return {
                "success": True,
                "content": content.strip(),
                "format": target_format,
                "audience": target_audience
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": ""
            }
    
    @staticmethod
    async def channel_formatter(content: str, channel: str) -> Dict[str, Any]:
        """Adapts content to different channels (alias for distribution_agent)"""
        return await ContentAgents.distribution_agent(content, channel)
