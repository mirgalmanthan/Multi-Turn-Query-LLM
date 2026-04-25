# Multi-Turn Query LLM

A monorepo containing the backend and frontend for the Husqvarna GIS developer assignment — a minimal LLM query app with JWT auth and streaming responses.

## Project Structure

```
.
├── backend/    # Node.js + Express + TypeScript API
└── frontend/   # (coming soon)
```

## Backend

### Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRY_MIN` | Token expiry in minutes (default: 30) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `LLM_MODEL` | OpenAI model to use (default: gpt-4o-mini) |
| `CORS_ORIGIN` | Allowed CORS origin (default: *) |

### API Endpoints

#### `POST /api/auth/demo`
Issues a demo JWT — no credentials required.

**Response:**
```json
{
  "statusCode": 200,
  "errors": [],
  "payload": { "token": "<jwt>" }
}
```

#### `POST /api/query`
Streams an LLM response as Server-Sent Events. Requires a valid Bearer token.

**Headers:** `Authorization: Bearer <token>`

**Body:** `{ "query": "Your question here" }`

**Response (SSE stream):**
```
data: {"type":"chunk","content":"..."}
data: {"type":"done"}
```
