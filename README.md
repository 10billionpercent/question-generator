# VedaAI – AI Assessment Creator

> **Hiring Assignment Submission.** This project was built as part of an interview/hiring process for VedaAI. The task was to design and implement a full-stack, production-grade AI Assessment Creator from scratch — covering everything from system architecture and background job processing to real-time WebSocket communication and polished PDF export.

The core idea is simple: a teacher uploads their study material (PDF or plain text), defines how they want the question paper structured — how many MCQs, short answers, long answers, how many marks each — and the system takes it from there. Google Gemini processes the content, generates a structured question paper, and renders it into a clean, academic-style PDF, all in the background while the frontend shows live progress.

The implementation is a **monorepo** with a clear separation of concerns — an Express API that stays fast and non-blocking by handing off all heavy work to background workers (BullMQ + Redis), a Next.js frontend that communicates over WebSockets for real-time updates, and a shared package for types and schemas. The stack was chosen to be scalable, production-deployable on free-tier infrastructure, and developer-friendly — with environment-aware storage (local disk in dev, MongoDB in prod) and a Gemini model fallback chain so generation doesn't fail if one model is rate-limited.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Real-Time Updates (WebSocket)](#real-time-updates-websocket)
- [Deployment](#deployment)
- [Features](#features)

---

## Architecture

### System Flow

```mermaid
flowchart TD
    User(["👤 Teacher"])

    subgraph FE ["Next.js Frontend"]
        direction TB
        Create["Upload & Configure"]
        Preview["Paper Preview & PDF"]
        WS["Socket.IO Client"]
    end

    subgraph API ["Express API"]
        direction TB
        Gen["POST /generation"]
        Papers["GET /papers"]
        Auth["POST /auth"]
    end

    subgraph Workers ["Background Workers — BullMQ"]
        direction LR
        Extract["Extract Text"] --> Generate["Gemini AI"] --> PDF["Render PDF"]
    end

    Redis[("Redis\nQueue + Pub/Sub")]
    Mongo[("MongoDB")]
    Gemini["Google Gemini"]

    classDef db fill:#2d2d2d,stroke:#666,color:#fff
    classDef worker fill:#2d2d2d,stroke:#666,color:#fff
    class Redis,Mongo db
    class Extract,Generate,PDF worker

    User -->|"uploads file + config"| Create
    Create -->|"POST multipart"| Gen
    Gen -->|"enqueue job"| Redis
    Redis -->|"dequeue"| Extract
    Generate -->|"API call"| Gemini
    Gemini -->|"structured JSON"| Generate
    Generate -->|"save paper"| Mongo
    PDF -->|"save PDF"| Mongo
    PDF -->|"publish done"| Redis
    Redis -->|"push event"| API
    API -->|"WebSocket"| WS
    WS -->|"redirect"| Preview
    Preview -->|"fetch paper"| Papers
    Papers --> Mongo
```

### Request Lifecycle

```mermaid
sequenceDiagram
    actor Teacher
    participant FE as Frontend (Next.js)
    participant API as Express API
    participant Queue as BullMQ (Redis)
    participant Worker as Background Worker
    participant Gemini as Google Gemini AI
    participant DB as MongoDB

    Teacher->>FE: Upload file + configure breakdown
    FE->>API: POST /api/generation/upload
    API->>Queue: Enqueue extraction job
    API-->>FE: { jobId, assignmentId }
    FE->>API: WS subscribe_to_assignment

    Queue->>Worker: Extract text from PDF
    Worker->>Queue: Enqueue generation job
    Worker-->>API: Publish progress (Redis)
    API-->>FE: generation_progress (extracting)

    Queue->>Worker: Generate questions
    Worker->>Gemini: Structured prompt
    Gemini-->>Worker: JSON question paper
    Worker->>DB: Save paper
    Worker->>Queue: Enqueue PDF job
    Worker-->>API: Publish progress (generating)
    API-->>FE: generation_progress (generating)

    Queue->>Worker: Render PDF (Browserless)
    Worker->>DB: Save PDF buffer
    Worker-->>API: Publish completed
    API-->>FE: generation_completed { paperId, pdfUrl }
    FE->>FE: Redirect to /assignments/created
    Teacher->>FE: Download PDF
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router) + TypeScript |
| Styling | CSS Variables (no Tailwind, no CSS Modules) |
| Runtime | Node.js + TypeScript |
| API Framework | Express |
| Database | MongoDB (Mongoose) |
| Job Queue | BullMQ (Redis) |
| AI | Google Gemini (`generative-ai` SDK) |
| PDF Generation | Handlebars + Browserless |
| File Extraction | pdf-parse-new |
| Authentication | bcryptjs + jsonwebtoken |
| Realtime | Socket.IO + Redis Pub/Sub |
| Storage (prod) | MongoDB (GridFS-style Buffers) |
| Icons | Lucide (consistent across sidebar + mobile nav) |
| Package Manager | pnpm |
| Monorepo Tooling | pnpm workspaces |

---

## Monorepo Structure

```
question-generator/
├── apps/
│   ├── backend/               # Express API server
│   │   ├── app/
│   │   │   ├── routes/        # auth, generation, papers
│   │   │   ├── models/        # Mongoose schemas
│   │   │   └── socket/        # Socket.IO + Redis pub/sub
│   │   └── index.ts
│   ├── worker/                # Background job processor
│   │   └── jobs/              # extract, generate, pdf workers
│   └── frontend/              # Next.js app
│       ├── app/
│       │   ├── assignments/
│       │   │   ├── create/    # Assignment creation form
│       │   │   └── created/   # Paper preview + PDF download
│       │   ├── layout.tsx
│       │   └── page.tsx       # Dashboard
│       ├── components/
│       │   ├── Sidebar.tsx    # Desktop nav
│       │   ├── TopBar.tsx     # Desktop page header
│       │   ├── MobileHeader.tsx
│       │   └── MobileNav.tsx  # Bottom tab bar
│       └── services/
│           └── assignmentService.ts
├── packages/
│   └── shared/                # Zod schemas, WebSocket types
├── pnpm-workspace.yaml
├── package.json               # Root scripts (dev:all, build)
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm — `npm i -g pnpm`
- MongoDB (local or Atlas URI)
- Redis (local or cloud)
- Google Gemini API key — [get one free](https://aistudio.google.com/app/apikey)
- *(Optional)* Browserless API key for production PDFs — [browserless.io](https://www.browserless.io/)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/question-generator.git
cd question-generator

# Install all dependencies
pnpm install

# Build shared package (required before first run)
pnpm --filter @veda/shared build
```

---

## Environment Variables

Create a `.env` file at the **project root**. All apps load it via `dotenv`.

```env
# Server
PORT=4000
NODE_ENV=development          # or production

# Database
MONGO_URI=mongodb+srv://...

# Redis
REDIS_URI=redis://localhost:6379

# AI
GEMINI_API_KEY=your_key_here
AI_MODEL_TIMEOUT_MS=20000     # optional, per-model timeout

# JWT
JWT_SECRET=your_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Queue
QUEUE_NAME=paper-generation

# PDF (production only)
BROWSERLESS_API_KEY=your_key
```

For the frontend, create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Running Locally

Start Redis server:

```bash
wsl
sudo service redis-server start
```

Start the API server and worker together:

```bash
pnpm dev:all
```

Start the frontend:

```bash
cd apps/frontend
pnpm dev
```

Or individually:

```bash
pnpm --filter @veda/backend dev    # API → http://localhost:4000
pnpm --filter @veda/worker dev     # Background worker
pnpm --filter frontend dev         # Frontend → http://localhost:3000
```

**Health check:** `GET http://localhost:4000/health` → `{"status":"ok"}`

---

## API Documentation

### Authentication

All endpoints accept an optional `Authorization: Bearer <token>` header. Guests can generate papers without signing in; signed-in users get papers linked to their account.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Create account | none |
| POST | `/api/auth/login` | Login, returns JWT | none |
| GET | `/api/auth/me` | Current user + their papers | required |

```bash
# Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Shrey","emailOrPhone":"shrey@meow.edu","institutionName":"Meow Engineering College","password":"mypassword123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"shrey@meow.edu","password":"mypassword123"}'
```

---

### Generation

Two endpoints depending on whether you have a file:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generation/start` | JSON-only, no file |
| POST | `/api/generation/upload` | Multipart form with file |

**Request fields:**

| Field | Type | Notes |
|---|---|---|
| `title` | string | Subject/title — required |
| `classLevel` | string | e.g. "BE 6th Sem" |
| `institutionName` | string | School/college name |
| `questionBreakdown` | array | Preferred — see format below |
| `totalQuestions` | number | Used if no breakdown |
| `marksPerQuestion` | number | Used if no breakdown |
| `questionTypes` | array | Used if no breakdown |
| `difficultyPreference` | enum | `easy` / `medium` / `hard` |
| `additionalInstructions` | string | Extra AI instructions |
| `file` | file | PDF or .txt (upload endpoint only) |

**`questionBreakdown` format:**

```json
[
  { "type": "mcq", "count": 10, "marks": 1 },
  { "type": "short-answer", "count": 5, "marks": 3 }
]
```

Accepted types: `mcq`, `short-answer`, `long-answer`, `true-false`, `fill-blanks`

**JSON-only example:**

```bash
curl -X POST http://localhost:4000/api/generation/start \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Computing",
    "classLevel": "BE 6th Sem",
    "institutionName": "Meow Engineering College",
    "questionBreakdown": [
      { "type": "mcq", "count": 5, "marks": 1 },
      { "type": "short-answer", "count": 3, "marks": 5 }
    ]
  }'
```

**File upload example:**

```bash
curl -X POST http://localhost:4000/api/generation/upload \
  -F "file=@/path/to/content.pdf" \
  -F "title=Cloud Computing" \
  -F "classLevel=BE 6th Sem" \
  -F "questionBreakdown[0][type]=mcq" \
  -F "questionBreakdown[0][count]=5" \
  -F "questionBreakdown[0][marks]=1" \
  -F "questionBreakdown[1][type]=short-answer" \
  -F "questionBreakdown[1][count]=3" \
  -F "questionBreakdown[1][marks]=5"
```

**Response:** `{ "message": "Generation job created", "jobId": "...", "assignmentId": "..." }`

The `assignmentId` is used to track progress and fetch the final paper.

---

### Papers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/papers/:assignmentId` | Fetch generated paper (JSON) |
| POST | `/api/papers/:assignmentId/pdf` | Trigger PDF generation |
| GET | `/api/papers/by-assignment/:assignmentId/pdf` | Download PDF (frontend-friendly) |
| GET | `/api/papers/:paperId/pdf` | Serve PDF from DB (production) |

```bash
# Fetch paper JSON
curl http://localhost:4000/api/papers/6a186c963184ae895c073e7b

# Trigger PDF generation
curl -X POST http://localhost:4000/api/papers/6a186c963184ae895c073e7b/pdf

# Download PDF
curl -J -O http://localhost:4000/api/papers/6a186c9c594164c6efe8bc1a/pdf
```

---

## Frontend Pages & Routes

| Route | Description |
|---|---|
| `/` | Dashboard — lists all assignments, filterable by title |
| `/assignments/create` | Form to configure and upload a new assignment |
| `/assignments/created?paperId=...` | Full paper preview with sections, marks, difficulty, answer key, and PDF download |

### UI Design Decisions

The frontend is based on the provided Figma design, with a few intentional deviations made to improve consistency, usability, and theme resilience:

- **Create Assignment button** — The Figma had this as a black button with an orange border. I changed the background to the brand color (`#E8470A`) directly, because black as a primary CTA blends into dark backgrounds and loses visual hierarchy. The orange always draws the eye regardless of what's behind it, which is exactly what a primary action button should do.

- **Mobile bottom nav** — The Figma used a dark/black bottom navigation bar. I changed this to match the app's light background with a subtle brand-color top border instead. The active tab is highlighted in the brand color. The original dark nav felt disconnected from the rest of the light UI — like two different apps stitched together. This change makes it feel cohesive, and the brand-color highlight still makes the active state obvious on both light and dark displays.

- **Top bar** — The Figma included a hamburger menu icon on the right side of the mobile top bar. I replaced it with a chevron (›) placed next to the user avatar instead, which opens a settings/logout dropdown. The hamburger implied a hidden side drawer that didn't exist in the design, and it was inconsistent with how the desktop sidebar works. The chevron pattern is already familiar from the desktop user menu, so this keeps the interaction model the same across breakpoints.

- **Icons** — The Figma used different icon styles in the sidebar vs the mobile nav. I unified both to use Lucide icons throughout, so every navigation item looks and feels identical whether you're on desktop or mobile. Small thing, but it adds up.

### `assignmentService.ts` exports

- `createAssignmentWithFile(formData, file)` — posts multipart form data
- `generatePDF(paperId)` — triggers PDF generation
- Types: `AssignmentFormData`, `QuestionBreakdownItem`, `UploadResponse`

---

## Real-Time Updates (WebSocket)

Connect and subscribe using `socket.io-client`:

```ts
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL);
socket.emit("subscribe_to_assignment", assignmentId);
```

**Events:**

| Event | Payload | Action |
|---|---|---|
| `generation_progress` | `{ stage, message, progress, assignmentId }` | Update progress bar |
| `generation_completed` | `{ assignmentId, paperId, paper, pdfUrl }` | Redirect to preview / auto-download |
| `generation_failed` | `{ assignmentId, error }` | Show error message |

---

## Deployment

The app is deployment-ready on **Render** (free tier). The API server and background worker run together via `pnpm run start:combined` using `concurrently`. MongoDB on Atlas, Redis on Render's managed Redis, and PDF generation through Browserless keeps Chromium off the free instance. Files and PDFs are stored as Buffers in MongoDB so there's no disk dependency in production.

---

## Features

- ✅ **AI-powered generation** — Multiple Gemini models with automatic fallback
- ✅ **Custom question breakdown** — Define sections by type, count, and marks
- ✅ **File upload & extraction** — PDF or plain text study material
- ✅ **Real-time progress** — WebSocket updates scoped per assignment
- ✅ **PDF export** — Academic layout with institution name, answer key, MCQ options
- ✅ **User authentication** — JWT signup/login; guest access works too
- ✅ **Background workers** — BullMQ handles all heavy tasks async
- ✅ **Environment-aware storage** — Local disk in dev, MongoDB in production
- ✅ **Scalable monorepo** — Clean separation via pnpm workspaces
- ✅ **Consistent UI** — Lucide icons unified across sidebar and mobile nav, brand-color CTAs and active states that work on both light and dark mode
