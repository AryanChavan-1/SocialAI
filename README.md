# SocialAI: Content Intelligence Platform

SocialAI is an autonomous agent orchestration platform designed to streamline the enterprise content lifecycle — from brand guideline ingestion and content drafting to compliance verification and multi-channel distribution.

---

## 🚀 Key Features

### 1. Live Agent Orchestration Graph
A real-time, event-driven workflow powered by Socket.io that coordinates multiple specialized agents:
- **Drafting Agent**: Generates high-quality content using Groq (LLama 3/Mixtral).
- **Compliance Agent**: Validates content against brand guidelines in real-time.
- **Human-in-the-Loop**: Seamless pauses for editorial approval before final deployment.

### 2. Knowledge-to-Content Transformation
- **Ingestion Engine**: Extracts brand DNA and guidelines from any live URL.
- **Entity Extractor**: Identifies technical products, pain points, and metrics from internal documents.
- **Targeted Assets**: Transforms technical knowledge bases into audience-specific marketing materials.

### 3. Performance & Strategy Dashboard
- **Insight Agent**: Analyzes multi-channel engagement data for behavioral patterns.
- **Strategy Agent**: Generates autonomous marketing adjustments based on performance data.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.12+), Socket.io (Real-time updates)
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons
- **AI Infrastructure**: Groq API (Inference), Pydantic (Strong Typing)
- **Database**: SQLite (SQLAlchemy ORM)
- **DevOps**: Docker & Docker Compose, PowerShell Production Scripts

---

## 💻 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Groq API Key (Fast & Free)

### Quick Setup (Local Dev)

1. **Clone & Configure**:
   ```bash
   git clone <your-repo-url>
   cd socialai
   cp .env.example .env
   # Add your GROQ_API_KEY to .env
   ```

2. **Start Backend**:
   ```bash
   pip install -r requirements.txt
   cd 'd:\et-gen\socialai'                                                                         
   .\production_run.ps1                  
   ```

## 🏗️ Project Structure

```text
socialai/
├── app/            # Next.js Application
├── components/     # UI Components (TSX)
├── agents.py       # Core AI Agent Logic
├── main.py         # FastAPI & Socket.io Backend
├── database.py     # SQLAlchemy Models & Session
├── brand_ingestion.py # Guideline Scraping Engine
├── .env.example    # Environment Template
└── docker-compose.yml # Container Orchestration
```

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
