"""Demo data for testing the AI agents"""

# Sample engagement data for insight analysis
SAMPLE_ENGAGEMENT_DATA = [
    {
        "post_id": "1",
        "content_type": "video",
        "platform": "linkedin",
        "views": 1500,
        "likes": 120,
        "shares": 45,
        "comments": 23,
        "clicks": 89,
        "date": "2024-01-15"
    },
    {
        "post_id": "2", 
        "content_type": "text",
        "platform": "linkedin",
        "views": 500,
        "likes": 30,
        "shares": 8,
        "comments": 5,
        "clicks": 12,
        "date": "2024-01-14"
    },
    {
        "post_id": "3",
        "content_type": "image", 
        "platform": "twitter",
        "views": 800,
        "likes": 65,
        "shares": 12,
        "comments": 8,
        "clicks": 34,
        "date": "2024-01-13"
    },
    {
        "post_id": "4",
        "content_type": "video",
        "platform": "twitter", 
        "views": 2000,
        "likes": 180,
        "shares": 67,
        "comments": 45,
        "clicks": 156,
        "date": "2024-01-12"
    },
    {
        "post_id": "5",
        "content_type": "text",
        "platform": "blog",
        "views": 300,
        "likes": 25,
        "shares": 3,
        "comments": 7,
        "clicks": 45,
        "date": "2024-01-11"
    }
]

# Sample brand guidelines
SAMPLE_BRAND_GUIDELINES = """
Our brand voice is professional yet approachable. We value:
- Clarity and simplicity in communication
- Innovation and forward-thinking
- Customer-centric approach
- Trust and reliability

Key terminology: "digital transformation", "cloud solutions", "AI-powered"
Avoid: overly technical jargon, promising unrealistic results
Target audience: Business decision makers, IT managers, enterprise leaders
"""

# Sample source text for knowledge transformation
SAMPLE_SOURCE_TEXT = """
Our company has developed a revolutionary AI platform that helps businesses automate their customer service operations. 
The platform uses advanced machine learning algorithms to understand customer queries and provide accurate responses in real-time. 
Key features include 24/7 availability, multilingual support, and seamless integration with existing CRM systems. 
Clients report a 40% reduction in customer service costs and a 60% improvement in response times. 
The system is HIPAA compliant and SOC 2 certified, ensuring the highest standards of security and privacy.
"""

# Demo content for compliance testing
SAMPLE_CONTENT = """
Our revolutionary AI-powered customer service platform will completely transform your business! 
With our cutting-edge technology, you'll see 1000% ROI in just one week. 
Our solution is guaranteed to solve all your problems and make your competitors obsolete. 
Contact us now for this limited-time offer that you absolutely cannot miss!
"""

# Demo topics and audiences for content generation
DEMO_TOPICS = [
    "The Future of AI in Business",
    "Digital Transformation Strategies",
    "Customer Experience Innovation",
    "Cloud Computing Best Practices",
    "Data Security in the Modern Enterprise"
]

DEMO_AUDIENCES = [
    "C-level executives",
    "IT managers", 
    "Marketing professionals",
    "Small business owners",
    "Software developers"
]

# Demo channels for content distribution
DEMO_CHANNELS = ["linkedin", "twitter", "blog", "instagram"]

# Demo locales for localization
DEMO_LOCALES = [
    {"locale": "es", "region": "Spain"},
    {"locale": "fr", "region": "France"}, 
    {"locale": "de", "region": "Germany"},
    {"locale": "ja", "region": "Japan"},
    {"locale": "pt", "region": "Brazil"}
]

# Demo formats for knowledge transformation
DEMO_FORMATS = [
    "blog post",
    "sales email", 
    "social media post",
    "press release",
    "case study"
]

def get_demo_request_data(endpoint: str) -> dict:
    """Get demo data for specific endpoints"""
    if endpoint == "/draft":
        return {
            "topic": "The Future of AI in Business",
            "audience": "C-level executives", 
            "tone": "professional",
            "brand_guidelines": SAMPLE_BRAND_GUIDELINES
        }
    
    elif endpoint == "/compliance":
        return {
            "content": SAMPLE_CONTENT,
            "brand_guidelines": SAMPLE_BRAND_GUIDELINES
        }
    
    elif endpoint == "/localize":
        return {
            "content": "Our AI platform helps businesses automate customer service operations.",
            "target_locale": "es",
            "target_region": "Spain"
        }
    
    elif endpoint == "/distribute":
        return {
            "content": "Our revolutionary AI platform transforms customer service with 24/7 availability and multilingual support.",
            "channel": "twitter"
        }
    
    elif endpoint == "/insights":
        return {
            "engagement_data": SAMPLE_ENGAGEMENT_DATA
        }
    
    elif endpoint == "/strategy":
        return {
            "insight": {
                "pattern": "Video posts perform 3x better than text posts on LinkedIn",
                "confidence": "high",
                "suggested_action": "Increase video content production"
            }
        }
    
    elif endpoint == "/extract-keywords":
        return {
            "source_text": SAMPLE_SOURCE_TEXT
        }
    
    elif endpoint == "/knowledge-to-content":
        return {
            "source_text": SAMPLE_SOURCE_TEXT,
            "target_audience": "IT managers",
            "target_format": "blog post"
        }
    
    elif endpoint == "/format-for-channel":
        return {
            "content": "Our AI platform helps businesses automate customer service with advanced machine learning.",
            "channel": "linkedin"
        }
    
    else:
        return {}
