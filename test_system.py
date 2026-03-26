import asyncio
import sys
import os
sys.path.append('.')

# Test imports first
try:
    from config import GROQ_API_KEY, OLLAMA_BASE_URL, USE_GROQ, USE_OLLAMA
    from ai_client import call_ai
    from agents import ContentAgents
    from brand_ingestion import ingest_brand_guidelines
    from demo_data import SAMPLE_BRAND_GUIDELINES, SAMPLE_CONTENT, SAMPLE_ENGAGEMENT_DATA
    print('✅ All imports successful')
except Exception as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)

# Test AI client connection
async def test_ai_connection():
    try:
        response = await call_ai('gpt-3.5-turbo', 'You are a helpful assistant.', 'Say hello')
        print(f'✅ AI Connection: {response[:50]}...')
        return True
    except Exception as e:
        print(f'❌ AI Connection failed: {e}')
        return False

# Test all agents
async def test_all_agents():
    print('\n🧪 Testing all AI Agents...')
    
    # Test 1: Drafting Agent
    try:
        result = await ContentAgents.drafting_agent('AI in Business', 'CEOs', 'professional')
        print(f'✅ Drafting Agent: {result["success"]} - {len(result.get("content", ""))} chars')
    except Exception as e:
        print(f'❌ Drafting Agent: {e}')
    
    # Test 2: Compliance Agent
    try:
        result = await ContentAgents.compliance_agent(SAMPLE_CONTENT, SAMPLE_BRAND_GUIDELINES)
        print(f'✅ Compliance Agent: {result["success"]} - Status: {result.get("result", {}).get("status", "unknown")}')
    except Exception as e:
        print(f'❌ Compliance Agent: {e}')
    
    # Test 3: Localization Agent
    try:
        result = await ContentAgents.localization_agent('Hello world', 'es', 'Spain')
        print(f'✅ Localization Agent: {result["success"]} - {len(result.get("content", ""))} chars')
    except Exception as e:
        print(f'❌ Localization Agent: {e}')
    
    # Test 4: Distribution Agent
    try:
        result = await ContentAgents.distribution_agent('This is a test post', 'twitter')
        print(f'✅ Distribution Agent: {result["success"]} - Channel: {result.get("channel", "unknown")}')
    except Exception as e:
        print(f'❌ Distribution Agent: {e}')
    
    # Test 5: Insight Agent
    try:
        result = await ContentAgents.insight_agent(SAMPLE_ENGAGEMENT_DATA)
        print(f'✅ Insight Agent: {result["success"]} - Insights: {len(result.get("insights", []))}')
    except Exception as e:
        print(f'❌ Insight Agent: {e}')
    
    # Test 6: Strategy Agent
    try:
        test_insight = {'pattern': 'Video performs better', 'confidence': 'high'}
        result = await ContentAgents.strategy_agent(test_insight)
        print(f'✅ Strategy Agent: {result["success"]} - Action: {result.get("action", {}).get("action_type", "unknown")}')
    except Exception as e:
        print(f'❌ Strategy Agent: {e}')
    
    # Test 7: Keyword Extractor
    try:
        result = await ContentAgents.keyword_extractor('Our AI platform uses machine learning')
        print(f'✅ Keyword Extractor: {result["success"]} - Keywords: {len(result.get("keywords", []))}')
    except Exception as e:
        print(f'❌ Keyword Extractor: {e}')
    
    # Test 8: Knowledge-to-Content Agent
    try:
        result = await ContentAgents.knowledge_to_content_agent('AI helps businesses', 'managers', 'blog post')
        print(f'✅ Knowledge-to-Content: {result["success"]} - {len(result.get("content", ""))} chars')
    except Exception as e:
        print(f'❌ Knowledge-to-Content: {e}')

# Test brand ingestion
async def test_brand_ingestion():
    print('\n🌐 Testing Brand Guidelines Ingestion...')
    try:
        # Test with a simple URL
        result = await ingest_brand_guidelines('https://example.com')
        print(f'✅ Brand Ingestion: {result["success"]} - Pages: {result.get("pages_scraped", 0)}')
    except Exception as e:
        print(f'❌ Brand Ingestion: {e}')

# Main test runner
async def main():
    print('🚀 Starting Real-Time System Test...')
    print(f'📊 Configuration - Groq: {USE_GROQ}, Ollama: {USE_OLLAMA}')
    
    # Test AI connection first
    ai_ok = await test_ai_connection()
    if not ai_ok:
        print('\n⚠️  AI connection failed, but testing agent structure...')
    
    # Test all agents
    await test_all_agents()
    
    # Test brand ingestion
    await test_brand_ingestion()
    
    print('\n✨ Real-time testing complete!')

if __name__ == '__main__':
    asyncio.run(main())
