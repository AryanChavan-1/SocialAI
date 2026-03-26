# SocialAI - Content Intelligence Platform

A comprehensive AI-powered content intelligence platform that automates content creation, compliance checking, and strategic insights using free APIs.

## 🚀 Features

### Concept 1: Live Agent Orchestration Graph
- **Drafting Agent**: Creates content from briefs using advanced AI
- **Compliance Agent**: Checks content against brand guidelines
- **Localization Agent**: Adapts content for different markets
- **Distribution Agent**: Formats content for specific channels

### Concept 2: Content Intelligence & Strategy Dashboard
- **Insight Agent**: Analyzes engagement data for patterns
- **Strategy Agent**: Generates autonomous actions from insights
- **Governance Agent**: Real-time brand monitoring

### Concept 3: Knowledge-to-Content Transformation
- **Keyword Extractor**: Identifies key entities from source documents
- **Knowledge-to-Content Agent**: Transforms documents into audience-specific assets
- **Channel Formatter**: Adapts content across platforms

### Key Feature: Dynamic Brand Guidelines Ingestion
Automatically extracts brand guidelines from any company URL using web scraping and AI analysis.

## 🛠️ Installation

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

3. **Optional: Set up Ollama for local AI**:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama3:8b
ollama pull llama3:70b
ollama pull gemma:7b
```

## 🚀 Quick Start

### Start the API server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Test with demo data:
```bash
curl -X POST "http://localhost:8000/draft" \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI in Business", "audience": "CEOs", "tone": "professional"}'
```

## 📚 API Endpoints

### Content Creation
- `POST /draft` - Create content from brief
- `POST /compliance` - Check brand compliance
- `POST /localize` - Adapt content for markets
- `POST /distribute` - Format for channels

### Intelligence & Strategy
- `POST /insights` - Analyze engagement data
- `POST /strategy` - Generate actions from insights
- `POST /governance` - Real-time brand monitoring

### Knowledge Transformation
- `POST /extract-keywords` - Extract entities
- `POST /knowledge-to-content` - Transform documents
- `POST /format-for-channel` - Cross-platform formatting

### Brand Guidelines
- `POST /ingest-brand-guidelines` - Extract from URL

### Workflow
- `POST /orchestrate-workflow` - Complete content creation pipeline
- `WebSocket /ws` - Real-time updates

## 🔧 Configuration

### Free API Options

1. **Groq (Recommended)**:
   - Free tier with generous limits
   - Fast response times
   - Models: Llama3 8B/70B, Gemma 7B

2. **Ollama (Local)**:
   - Completely free
   - Runs locally
   - Models: Llama3, Gemma, Mistral

3. **Replicate (Optional)**:
   - For image generation
   - Free tier available

### Model Mappings

| Original | Groq Equivalent | Ollama Equivalent |
|----------|----------------|-------------------|
| GPT-4 | llama3-70b-8192 | llama3:70b |
| GPT-3.5-turbo | llama3-8b-8192 | llama3:8b |
| Fast | gemma-7b-it | gemma:7b |

## 📖 Usage Examples

### Complete Content Workflow
```python
import requests

# 1. Ingest brand guidelines
brand_response = requests.post("http://localhost:8000/ingest-brand-guidelines", 
                               json={"url": "https://example-company.com"})
brand_guidelines = brand_response.json()["guidelines"]["content_guidelines"]

# 2. Draft content
draft_response = requests.post("http://localhost:8000/draft", json={
    "topic": "Digital Transformation",
    "audience": "IT Managers",
    "brand_guidelines": json.dumps(brand_guidelines)
})

# 3. Check compliance
content = draft_response.json()["content"]
compliance_response = requests.post("http://localhost:8000/compliance", json={
    "content": content,
    "brand_guidelines": json.dumps(brand_guidelines)
})

# 4. Distribute to channels
for channel in ["linkedin", "twitter"]:
    distribute_response = requests.post("http://localhost:8000/distribute", json={
        "content": content,
        "channel": channel
    })
```

### Intelligence Analysis
```python
# Analyze engagement patterns
engagement_data = [
    {"post_id": "1", "content_type": "video", "views": 1500, "likes": 120},
    {"post_id": "2", "content_type": "text", "views": 500, "likes": 30}
]

insights_response = requests.post("http://localhost:8000/insights", 
                                 json={"engagement_data": engagement_data})

# Generate strategy actions
insights = insights_response.json()["insights"]
for insight in insights:
    strategy_response = requests.post("http://localhost:8000/strategy", 
                                      json={"insight": insight})
```

## 🧪 Testing

Run the demo script to test all features:
```bash
python -c "
from demo_data import get_demo_request_data
import requests

base_url = 'http://localhost:8000'
endpoints = ['/draft', '/compliance', '/localize', '/insights']

for endpoint in endpoints:
    data = get_demo_request_data(endpoint)
    response = requests.post(f'{base_url}{endpoint}', json=data)
    print(f'{endpoint}: {response.status_code}')
"
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI        │    │   AI Services   │
│   (Your Friend) │◄──►│   Backend        │◄──►│   (Groq/Ollama) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Web Scraping   │
                       │   Brand Guidelines│
                       └──────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation at `http://localhost:8000/docs`
- Review the demo data in `demo_data.py`
- Check logs for error details

## 🌟 Key Benefits

- **100% Free**: Uses only free APIs and local models
- **Production Ready**: Includes error handling, rate limiting, and logging
- **Comprehensive**: Covers all content lifecycle stages
- **Flexible**: Easy to swap models and add new agents
- **Scalable**: Async architecture for high performance
- **Smart**: Dynamic brand guideline extraction from any URL
