# Multi-Turn Query LLM

A monorepo containing the backend and frontend for the Husqvarna GIS developer assignment — a minimal AI-powered query app with JWT auth, streaming LLM responses, and multi-turn conversation support.

## Project Structure

```
.
├── backend/        # Node.js + Express + TypeScript API
├── frontend/       # React + Vite + TypeScript chat UI
├── README.md
└── DEPLOYMENT.md   # AWS deployment notes
```

---

## Backend

### Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on http://localhost:3000
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRY_MIN` | Token expiry in minutes | `30` |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `LLM_MODEL` | Model to use | `gpt-4o-mini` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `CONVERSATION_WINDOW` | Max history messages sent to LLM | `10` |

### API Endpoints

#### `POST /api/auth/demo`
Returns a signed JWT for use in subsequent requests.

```json
{ "statusCode": 200, "errors": [], "payload": { "token": "<jwt>" } }
```

#### `POST /api/query`
Streams an LLM response as Server-Sent Events. Requires a Bearer token.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "query": "What is GeoJSON?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

`history` is optional — omit it for single-turn queries. The backend applies a sliding window (controlled by `CONVERSATION_WINDOW`) before sending to the LLM.

**Response (SSE stream):**
```
data: {"type":"chunk","content":"..."}
data: {"type":"done"}
data: {"type":"error","message":"..."}
```

### Docker

```bash
cd backend
docker build -t query-llm-backend .
docker run --env-file .env -p 3000:3000 query-llm-backend
```

---

## Frontend

### Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # starts on http://localhost:5173
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:3000` |

---

## Running Locally

Start both servers in separate terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Then open `http://localhost:5173`.
