# API Key Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure Gemini API keys by moving Google Generative AI API calls to a serverless backend proxy (`/api/gemini`), preventing client-side API key exposure while keeping multi-model fallback, multi-key rotation, and emergency UI key input intact.

**Architecture:** A unified serverless function (`/api/gemini.js`) handles AI generation on the server. A Vite dev middleware connects local development seamlessly. The frontend client (`src/lib/gemini-client.js`) sends HTTP POST requests to `/api/gemini` instead of bundling the Google SDK.

**Tech Stack:** Node.js, Vite 8, React 19, @google/generative-ai, Vercel Serverless Function

**Spec:** [2026-09-18-api-key-security-design.md](file:///d:/Project/MediSift%20AI/docs/superpowers/specs/2026-09-18-api-key-security-design.md)

## Global Constraints
- Do not use `gemini-1.5-flash` or `gemini-1.5-pro` (they return 404 in this environment). Stick strictly to the fallback array: `['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash']`.
- Maintain anti-recitation prompt rules and `temperature: 0.4` to avoid Google copyright/recitation filters.
- Support emergency backup key input from UI (`customApiKey`).
- No jargon; keep error messages user-friendly.

---

### Task 1: Environment Variables Migration

**Files:**
- Modify: `.env`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Existing API keys in `.env`
- Produces: `GEMINI_API_KEYS` accessible in server/Node environment, stripping `VITE_` prefix to block client bundle embedding.

- [ ] **Step 1: Check existing .env content**
- [ ] **Step 2: Update .env.example with GEMINI_API_KEYS**
- [ ] **Step 3: Update .env with GEMINI_API_KEYS retaining user's actual keys**

---

### Task 2: Serverless Backend Proxy (`api/gemini.js`)

**Files:**
- Create: `api/gemini.js`

**Interfaces:**
- Consumes: `POST /api/gemini` with `{ action: 'ANALYZE' | 'SUGGEST' | 'POLYPHARMACY', payload: object, customApiKey?: string }`
- Produces: JSON response `{ success: true, data: object }` or HTTP error `{ success: false, error: string, code: string }`

- [ ] **Step 1: Write `api/gemini.js` with structured schemas, multi-key rotation, and model fallback**
- [ ] **Step 2: Export standard handler `handler(req, res)` supporting both Node HTTP (Vite/Express) and Vercel Serverless**

---

### Task 3: Vite Dev Server Middleware (`vite.config.js`)

**Files:**
- Modify: `vite.config.js`

**Interfaces:**
- Consumes: Incoming requests to `/api/gemini` during `npm run dev`
- Produces: Intercepts request, parses JSON body, executes `api/gemini.js` handler, and streams response back to client.

- [ ] **Step 1: Add connect middleware plugin to `vite.config.js`**
- [ ] **Step 2: Ensure Node environment loads `.env` so `process.env.GEMINI_API_KEYS` is populated**

---

### Task 4: Frontend Client Refactor (`src/lib/gemini-client.js`)

**Files:**
- Modify: `src/lib/gemini-client.js`

**Interfaces:**
- Consumes: Frontend calls from `App.jsx` (`analyzeDrug`, `suggestDrugs`, `analyzePolypharmacy`, `determineIntent`)
- Produces: Dispatches `fetch('/api/gemini')` sending action and emergency `customApiKey` if present in `localStorage`.

- [ ] **Step 1: Replace Google SDK import with `fetch('/api/gemini')` dispatch helper**
- [ ] **Step 2: Adapt `analyzeDrug`, `suggestDrugs`, `analyzePolypharmacy` to forward payloads to `/api/gemini`**
- [ ] **Step 3: Keep zero-cost `determineIntent` local rule-based router intact**

---

### Task 5: Build & End-to-End Verification

**Files:**
- Test scripts / Commands

- [ ] **Step 1: Run `npm run build` to verify frontend compiles cleanly without SDK leaks**
- [ ] **Step 2: Test `/api/gemini` directly with a test script simulating ANALYZE, SUGGEST, and POLYPHARMACY**
- [ ] **Step 3: Verify error handling for missing/invalid keys**
