# DB Terracrest Advisory

An invitation-only deal platform for high-value Bengaluru real estate — joint
developments, Grade-A warehousing, and large contiguous land. Access is granted by
the desk after offline KYC; there is no self-signup. Every parcel is verified on the
ground before it is shown, and its sensitive details stay **sealed** behind a masking
layer until a witnessed NDA is logged.

The product's two signatures:

- **The masking moat.** Coordinates, owner identity, survey numbers, and contacts
  are withheld by the server and revealed only to entitled parties. This is enforced
  in the API (`backend/app/routers/listings.py:can_see_sealed`), not the UI — the
  sealed fields never leave the server without a logged NDA.
- **The Feasibility Studio.** A live, parametric GDV engine: adjust towers, FSI,
  floor-plate efficiency, unit mix, sale price, and material finishes, and watch the
  three-zone Net Development Value (Bear / Base / Bull) recompute in real time —
  before an architect is engaged or a rupee committed. A builder can then commission
  the empanelled architect, whose stamped, validated figure returns beside the ML
  estimate.

## Stack

- **Frontend** — Vite + React + TypeScript, Tailwind, Framer Motion, Leaflet.
  Design language: "The Land Ledger" — warm paper stock, forest green for land and
  growth, old gold reserved for the money; Space Grotesk display over Satoshi body
  and IBM Plex Mono annotations, with wireframe massing art and redaction bars as
  the house motifs. Palette chosen for the audience: green and gold read prosperity
  and auspiciousness to Indian principals; black canvases and violet gradients do not.
- **Backend** — FastAPI + SQLAlchemy + Postgres (SQLite in dev), JWT access/refresh,
  bcrypt, watermarked-PDF document vault, an append-only audit trail.
- **Seam** — the frontend talks to a single async repository
  (`src/data/repository.ts`). Set `VITE_API_URL` and it uses the API; leave it unset
  and it serves an in-memory seed. The UI never knows the difference — this is the
  "demo now, built to grow" pivot.

## What's in the box

- Cinematic landing page and an exclusive, admin-issued login
- Role dashboards — builder, landowner, investor, and the admin **Operations Centre**
- Masked discovery → NDA unlock → sealed reveal, with an NDA-gated precision map
- Document vault (gated, watermarked PDFs)
- Deal Room (post-NDA messaging between entitled parties)
- Feasibility & GDV Studio with a live, admin-maintained price book
- Architect validation workflow (ML estimate vs. stamped human figure)
- Operations Centre: account management, parcel lifecycle, price book, architect
  queue, and a full audit feed with notifications

## Run it locally

**Backend**

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # (or: source .venv/bin/activate)
pip install -r requirements.txt
python -m app.seed          # create + populate the dev database
uvicorn app.main:app --reload
pytest -q                   # the API test suite
```

**Frontend**

```bash
npm install
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local   # omit to run on the in-memory seed
npm run dev
```

All demo logins use the password `demo`. Try `admin_terracrest` (the desk),
`builder_rajesh_001` (an NDA'd builder), or `landowner_ramanathan_002`.

## Deployment

The pilot runs on managed hosting — the static frontend on Vercel, the API and
Postgres on a small managed tier. The production target is a **self-hosted,
no-cloud, three-machine** deployment under the firm's physical control, so no
third-party ever holds a byte of sealed data. That build-out — LUKS, WireGuard,
Postgres streaming replication, encrypted nightly backups, and an air-gapped cold
vault — is documented step by step in
[`docs/on-prem-runbook.md`](docs/on-prem-runbook.md), with the systemd units, Nginx
config, and backup scripts in [`ops/on-prem/`](ops/on-prem).
