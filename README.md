# Mind Heal AI

> **A Healthier Mind. A Better Life.**

Mind Heal AI is a domain-specific conversational AI assistant built for the Mind Heal platform.

The system combines **Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), vector search, query expansion, deterministic keyword filtering, hybrid search, and custom reranking** to provide context-aware responses based on the Mind Heal product knowledge base.

The goal is to avoid relying entirely on an LLM's internal knowledge and instead ground product-related responses in the application's own product data.

---

## ✨ Features

- 🤖 AI-powered conversational interface
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔍 Semantic vector search using ChromaDB
- 🔄 LLM-powered query expansion
- 🌐 English, Hindi and Hinglish query support
- 🔎 Deterministic keyword/text relevance filtering
- 📊 Hybrid semantic + keyword reranking
- 🎯 Custom relevance scoring
- 🔢 Exact Mind Heal product-number lookup
- 🤝 Multi-model LLM architecture
- 🗃️ MySQL → ChromaDB product synchronization
- ⚡ Compact RAG context generation
- 🔐 Backend-only LLM API integration
- 🌐 Express.js REST API
- ⚛️ React chat interface
- 🛡️ Input validation and API error handling
- 💬 Natural conversational AI personality

---

# 🏗️ Architecture

The application follows a multi-stage AI pipeline rather than directly sending the user's question to an LLM.


                         ┌─────────────────────┐
                         │    React Chat UI     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Express.js API   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    User Question    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │      Query Processing        │
                    │                              │
                    │ Exact Product Detection      │
                    │          OR                  │
                    │ LLM Query Expansion          │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │     ChromaDB        │
                         │  Semantic Search    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Candidate Products  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │      Hybrid Reranking        │
                    │                              │
                    │ Semantic Relevance           │
                    │ Keyword Relevance            │
                    │ Score Normalization          │
                    │ Multi-query Match Signals    │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │   Top Products      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │    Compact RAG Context       │
                    │                              │
                    │ Product Name                 │
                    │ Mind Heal Number             │
                    │ Short Description            │
                    │ Emotional Tags               │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │      Main LLM       │
                         │  Answer Generation  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ AI Answer + Products│
                         └─────────────────────┘


       ┌───────────────────────┐
       │        MySQL          │
       │ Product Source of     │
       │ Truth                 │
       └───────────┬───────────┘
                   │
                   │ Product Sync / Upsert
                   ▼
       ┌───────────────────────┐
       │       ChromaDB        │
       │ Vector Knowledge Base │
       └───────────────────────┘
🔄 RAG Pipeline

The core pipeline is:

User Query
    ↓
Query Processing
    ↓
Original + Expanded Queries
    ↓
Multi-Query Vector Search
    ↓
Candidate Aggregation
    ↓
Keyword Filtering
    ↓
Hybrid Reranking
    ↓
Top Relevant Products
    ↓
Compact RAG Context
    ↓
Main LLM
    ↓
Grounded AI Response
🧠 Why RAG?

A traditional chatbot can follow this architecture:

User
 ↓
LLM
 ↓
Answer

This approach relies heavily on the model's internal knowledge.

Mind Heal AI instead uses:

User
 ↓
Retrieve relevant product information
 ↓
Provide retrieved context
 ↓
LLM
 ↓
Answer

This allows product-related responses to be grounded in the application's own knowledge base.

RAG also allows product knowledge to be updated without retraining the LLM.

🔍 Query Expansion

Users may describe the same situation in completely different ways.

For example:

mera kutta bahot jyada bahunkta hai

A product knowledge base may contain:

excessive barking
dog barking
dogs barking excessively

The system therefore uses a lightweight LLM to generate additional search representations.

Example:

Original Query
    ↓
Query Expansion
    ├── Original query
    ├── English variation
    ├── Hindi variation
    ├── Hinglish variation
    ├── Semantic variation
    └── Spelling variation

The original query is always preserved.

This prevents the expansion model from accidentally changing the user's original intent.

🔄 Multi-Query Retrieval

The original query and expanded queries are independently searched against ChromaDB.

Query 1 ──────┐
Query 2 ──────┤
Query 3 ──────┼──→ ChromaDB
Query 4 ──────┤
Query 5 ──────┘

The retrieved candidates are then merged.

Duplicate products are consolidated using their unique Chroma IDs.

The system also tracks how frequently a product appears across different search queries.

This provides an additional retrieval signal for reranking.

🔎 Hybrid Search

Pure semantic search is powerful, but semantic similarity alone may sometimes retrieve conceptually related products that are not the most precise match.

Mind Heal AI therefore combines:

Semantic Search
       +
Keyword Relevance
       ↓
Hybrid Ranking

The ranking process considers:

Semantic similarity
Keyword relevance
Normalized scores
Multi-query retrieval matches

This provides a balance between semantic understanding and deterministic textual relevance.

📊 Custom Reranking

Retrieved candidates are passed through a custom reranking layer.

Conceptually:

Semantic Score
       +
Keyword Score
       +
Multi-query Match Signal
       ↓
Score Normalization
       ↓
Final Relevance Score
       ↓
Sorted Products

Only the highest-ranked products are passed to the final generation stage.

This separates:

Retrieval Quality

from:

Response Generation

which makes the system easier to improve and evaluate independently.

🎯 Exact Product Lookup

Natural-language queries and exact product identifiers are treated differently.

For example:

Mind Heal No. 202

is an identifier-based query.

The system can detect an exact product-number request and perform deterministic lookup instead of unnecessarily sending the query through the full semantic expansion pipeline.

This provides:

Higher precision
Lower latency
Fewer unnecessary LLM calls
Lower token consumption
🤝 Multi-Model Architecture

Mind Heal AI separates different LLM responsibilities.

                  User Query
                      │
                      ▼
            ┌──────────────────┐
            │ Query Expansion  │
            │ Lightweight LLM  │
            └────────┬─────────┘
                     │
                     ▼
                ChromaDB
                     │
                     ▼
              Hybrid Search
                     │
                     ▼
             Relevant Context
                     │
                     ▼
            ┌──────────────────┐
            │   Main LLM       │
            │ Answer Generation│
            └──────────────────┘

The query-expansion model handles a relatively lightweight preprocessing task.

The main LLM handles final natural-language response generation.

This separation provides better control over:

Model specialization
Token usage
API cost
Response quality
🗃️ Product Knowledge Management

MySQL remains the canonical source of product information.

MySQL
  │
  │ Published Products
  ▼
Product Synchronization
  │
  ▼
Embedding Generation
  │
  ▼
ChromaDB

Products are indexed using an upsert-based synchronization process.

This allows existing vector records to be updated without manually recreating the entire vector database.

🏷️ Vector Metadata

Products stored in ChromaDB contain structured metadata such as:

mysql_id
mind_heal_no
name
name_hi
slug
emotional_tags
published
short_description
short_description_hi

This allows semantic search results to be connected back to the canonical product records.

🧾 RAG Context Optimization

The complete product database is not sent to the LLM.

Instead, only relevant information is selected.

Example:

SOURCE 1

Mind Heal No: 202

Product Name:
Excessively barking dogs

Short Description:
...

Hindi Short Description:
...

Emotional Tags:
...

The system then sends the compact context to the main LLM.

This reduces:

Unnecessary input tokens
API cost
Context size
Irrelevant information

while retaining the information needed for the answer.

💬 AI Personality

Mind Heal AI is designed to be more conversational than a standard question-answering bot.

The assistant aims to be:

Warm
Friendly
Empathetic
Intelligent
Conversational
Slightly playful when appropriate
Concise
Non-robotic
Non-pushy

The assistant should feel like:

"An intelligent companion that understands the conversation and knows the Mind Heal product catalog."

rather than:

"A product search engine."

The AI can use light humor or emojis in normal situations, but avoids humor in sensitive situations such as grief, trauma, severe distress or emergencies.

🛡️ AI Safety & Grounding

The system is designed with several guardrails.

Product Grounding

The AI is instructed to use only retrieved product information when discussing Mind Heal products.

It should not invent:

Ingredients
Product benefits
Dosage
Medical effects
Product claims
No Diagnosis

The assistant does not diagnose users.

No Prescription

The assistant does not prescribe medicines or instruct users to change prescribed medication.

No Forced Recommendations

If the retrieved products do not clearly match the user's query, the assistant should not force a product recommendation.

Pet Queries

For animal-related queries, the assistant avoids veterinary diagnosis or treatment instructions and can recommend consulting a veterinarian when appropriate.

🌐 API Architecture

The RAG pipeline is exposed through an Express.js backend.

Health Check
GET /api/health

Example response:

{
  "success": true,
  "message": "Mind Heal API is running"
}
AI Chat
POST /api/mind-heal/chat

Request:

{
  "question": "mera kutta bahot jyada bhonkta hai"
}

Response:

{
  "success": true,
  "question": "mera kutta bahot jyada bhonkta hai",
  "answer": "AI generated response...",
  "products": [
    {
      "mysql_id": 67,
      "mind_heal_no": "202",
      "name": "Excessively barking dogs",
      "name_hi": "...",
      "slug": "...",
      "emotional_tags": "...",
      "score": 0.91
    }
  ]
}
⚛️ React Integration

The React frontend communicates with the Express backend.

React
  │
  │ POST /api/mind-heal/chat
  ▼
Express
  │
  ▼
RAG Pipeline
  │
  ▼
AI Response
  │
  ▼
React Chat UI

The OpenRouter API key remains on the backend and is never exposed to the browser.

🔐 Environment Configuration

Create a .env file:

OPENROUTER_API_KEY=your_openrouter_api_key

OPENROUTER_MAIN_MODEL=openai/gpt-4o-mini

PORT=3000

Never commit API keys or secrets to GitHub.

Add .env to .gitignore:

.env
node_modules/
🛠️ Technology Stack
Frontend
React.js
Backend
Node.js
Express.js
AI / GenAI
Large Language Models
OpenRouter
OpenAI-compatible API
Query Expansion
Retrieval-Augmented Generation
Vector Search
ChromaDB
Embeddings
Semantic Search
Search / Retrieval
Hybrid Search
Keyword Matching
Custom Reranking
Score Normalization
Multi-query Retrieval
Database
MySQL
ChromaDB
Development
Nodemon
REST APIs
Environment-based configuration
📁 Project Structure
chromadb/
│
├── server.js
├── search-product.js
├── sync-product.js
├── test.html
├── package.json
├── .env
│
├── rag/
│   ├── query-expansion.js
│   ├── hybrid-search.js
│   └── answer.js
│
└── ...

The exact project structure may evolve as the application grows.

🚀 Running Locally
1. Install dependencies
npm install
2. Configure environment variables

Create:

.env

and add:

OPENROUTER_API_KEY=your_key
OPENROUTER_MAIN_MODEL=openai/gpt-4o-mini
PORT=3000
3. Start development server
npm run dev

Or:

npm start
🧪 Testing

Health endpoint:

curl http://localhost:3000/api/health

AI chat:

curl -X POST http://localhost:3000/api/mind-heal/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "mera kutta bahot jyada bhonkta hai"
  }'

Interactive test interface:

http://localhost:3000/test
📈 Engineering Decisions
Why RAG?

To ground responses in application-specific product information.

Why ChromaDB?

To provide semantic vector retrieval for the product knowledge base.

Why Query Expansion?

To improve retrieval recall for natural-language, multilingual and Hinglish queries.

Why Hybrid Search?

To combine semantic understanding with deterministic textual relevance.

Why Custom Reranking?

To avoid blindly trusting the initial vector-search order.

Why Multiple LLMs?

To separate lightweight query processing from higher-quality final response generation.

Why MySQL + ChromaDB?

MySQL remains the source of truth for structured product data, while ChromaDB serves the semantic retrieval layer.

Why Exact Product Lookup?

Product numbers are identifiers and should be resolved deterministically rather than semantically.

💰 Token & Cost Optimization

The system applies several strategies to reduce unnecessary LLM usage:

Exact Product Query
        ↓
Skip unnecessary expansion

and:

Normal Query
        ↓
Lightweight Query Expansion
        ↓
Compact RAG Context
        ↓
Main LLM

The system also avoids sending complete product documents when only short descriptions and relevant metadata are required.

🔮 Future Improvements

The architecture is designed to support additional capabilities in future versions.

Potential improvements include:

Retrieval evaluation dataset
Recall@K / Precision@K evaluation
Retrieval confidence thresholds
Dedicated reranker models
Query and response caching
Streaming AI responses
Conversation memory
User feedback-based retrieval improvement
Production monitoring and observability
LLM fallback strategies
Authentication-aware AI experiences
Conversational shopping workflows
Explicit user-confirmed cart actions
AI-assisted checkout workflows

For transactional operations, AI-generated intent should remain separate from deterministic backend business logic.

📊 Evaluation Strategy

Future evaluation can separate the system into two independent components.

Retrieval Evaluation

Measure:

Recall@K
Precision@K
MRR
Ranking quality

Example:

User Query
    ↓
Expected Product
    ↓
Top-K Retrieved Products
    ↓
Evaluate Retrieval
Generation Evaluation

Measure:

Relevance
Groundedness
Answer quality
Unsupported claims
User satisfaction
Response latency
Token consumption
🔒 Security Considerations
LLM API keys are kept server-side.
Environment variables are used for secrets.
User input is treated as untrusted input.
Retrieved documents are treated as data, not instructions.
AI-generated output should not directly execute critical transactional operations.
Business-critical actions should be validated by deterministic backend logic.
🎯 Project Objective

Mind Heal AI is designed around a simple principle:

The LLM should not be the entire application.

Instead, the system separates:

Language Understanding
        +
Information Retrieval
        +
Relevance Ranking
        +
Context Construction
        +
Response Generation

This modular architecture makes the AI system easier to optimize, evaluate, maintain and extend.

👨‍💻 Key AI Engineering Concepts Demonstrated

This project demonstrates practical experience with:

Retrieval-Augmented Generation
LLM application architecture
Multi-model orchestration
Prompt engineering
Query expansion
Embeddings
Vector databases
Semantic search
Keyword search
Hybrid retrieval
Ranking and reranking
Score normalization
Context optimization
Token optimization
AI API integration
Backend AI architecture
Structured metadata
Database synchronization
AI safety and grounding
REST API design
React + AI integration
📌 Current Status
Completed
 React AI chat interface
 Express AI API
 OpenRouter integration
 ChromaDB vector search
 Product embeddings
 Query expansion
 Multi-query retrieval
 Candidate aggregation
 Keyword filtering
 Hybrid reranking
 Exact product lookup architecture
 RAG context generation
 Separate answer-generation model
 MySQL → ChromaDB synchronization
 API health check
 Local AI testing interface
Planned
 Retrieval evaluation framework
 Advanced reranking
 Conversation memory
 Streaming responses
 User authentication integration
 Conversational product purchase flow
 Explicit user-confirmed cart actions
 Production monitoring
 AI-assisted checkout
🧠 Summary

Mind Heal AI is more than a basic LLM chatbot.

It is a domain-specific AI retrieval and generation system that combines:

React
  +
Express.js
  +
LLMs
  +
Query Expansion
  +
ChromaDB
  +
Embeddings
  +
Keyword Filtering
  +
Hybrid Search
  +
Custom Reranking
  +
RAG
  +
MySQL

The architecture is designed to provide relevant, grounded and conversational AI responses while keeping product data, retrieval logic and transactional business logic separate from probabilistic LLM behavior.

License

This project is proprietary software developed for Mind Heal.

All rights reserved. 
