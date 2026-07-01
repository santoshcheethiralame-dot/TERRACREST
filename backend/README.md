# DB Terracrest Advisory — API

FastAPI backend for the invitation-only deal portal. It enforces the masking
moat **server-side**: sealed parcel details (exact GPS, owner, survey numbers,
document vault) are never serialized without a logged NDA.

## Stack
- FastAPI + Uvicorn
- SQLAlchemy 2.0 (SQLite for dev, PostgreSQL-ready — swap `TERRACREST_DATABASE_URL`)
- JWT auth (PyJWT) + bcrypt password hashing

## Run (Windows)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m app.seed          # create + seed the database
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

Then open the interactive docs at http://localhost:8000/docs

## Demo logins
All seeded accounts use the password `demo`:
- `builder_rajesh_001` (Builder)
- `landowner_ramanathan_002` (Land Owner)
- `investor_khanna_005` (Investor)

## Key endpoints
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{username, password}` → JWT + user |
| GET | `/auth/me` | current user (Bearer token) |
| GET | `/listings` | discovery feed — **sealed stripped unless entitled** |
| GET | `/listings/{id}` | single parcel — masked/unmasked per NDA |
| GET | `/listings/{id}/unlocked` | `{unlocked}` for the caller |
| POST | `/listings/{id}/nda` | log an executed NDA → unseals the parcel |
| GET | `/listings/{id}/engagement` | named analytics (owner) |
| GET | `/listings/{id}/offers` | expressions of interest |
| GET | `/me/properties` · `/me/ndas` · `/me/deals` | caller-scoped |

## Deploy (make the public link full-stack)

**Render — one-click blueprint:**
1. Push this repo to GitHub (already connected).
2. Render → **New → Blueprint** → pick this repo. The root `render.yaml`
   provisions a free web service **and** a free Postgres and wires them together
   (JWT secret auto-generated, CORS set to the Vercel origin). First boot
   **auto-seeds** the database.
3. Copy the deployed API URL (e.g. `https://terracrest-api.onrender.com`).
4. In **Vercel → the `terracrest` project → Settings → Environment Variables**,
   add `VITE_API_URL = <that URL>` and redeploy. The public site is now full-stack.

If you use a custom domain for the frontend, add it to `TERRACREST_CORS_ORIGINS`.

**On-prem (the spec's zero-cloud path):** point `DATABASE_URL` at your own
PostgreSQL and run the Docker image (`backend/Dockerfile`) on company hardware.
No code changes — SQLite (dev) → Postgres (prod) is a URL swap.
