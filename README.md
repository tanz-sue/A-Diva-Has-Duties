# A Diva Has Duties

**Break it. Do it. Done.** Your task, gamified into a legendary adventure.

Type in what you need to get done. It gets broken into subtasks. Every
subtask you check off drains a monster's energy bar until it's defeated.
Do enough of that and your Diva Fighter levels up. No penalty for an
unfinished battle — the monster just waits for you to come back.

## Features

- Email/password sign up and login
- Pick a Diva Fighter (Witch Cat, Raccoon Baker, or Penguin Wizard)
- Type a task (or a whole messy schedule dump) and Gemini breaks it into
  3–6 concrete subtasks
- Each task spawns a random monster with its own energy bar
- Checking off subtasks drains the bar; hitting zero defeats the monster
- Leveling system: more tasks required to level up as you go higher
  (see table below)
- Dashboard: current level progress + last monster you defeated
- Unfinished tasks can be rejoined anytime from the sidebar or Dashboard
- How It Works explainer page for new visitors

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router |
| Backend | FastAPI (Python) |
| AI | Gemini (`gemini 2.5 pro`) for subtask generation |
| Database / Auth | Supabase (Postgres + Auth) — **schema created, not yet wired into the backend; see Status below** |

## Project structure

```
diva-has-duties/
├── frontend/          React app — see frontend/README.md
├── backend/           FastAPI app — see backend/README.md
└── README.md          you are here
```

## Quickstart

Full setup instructions live in each half's own README:

- [`frontend/README.md`](frontend/README.md) — installing, running, adding
  your artwork
- [`backend/README.md`](backend/README.md) — installing, running, API
  reference, environment variables

The short version:

```bash
# Terminal 1 — backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in your keys (see backend/README.md)
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Leveling table

| Level range | Tasks to level up |
|---|---|
| 1–10 | 2 |
| 11–50 | 4 |
| 51–100 | 6 |
| 101–150 | 8 |
| 151–200 | 10 |
| ... | +2 every 50 levels |
| 401+ | 20 (cap) |

Implemented in `backend/main.py`'s `tasks_required_for_level()`.

## Status: what's real vs. what's scaffolded

Worth knowing before you show this to anyone or rely on it:

- ✅ **Frontend** — all screens are fully built and wired to the backend API.
- ✅ **AI subtasks** — real Claude calls, with a generic fallback if no API
  key is set.
- ✅ **Supabase database** — the `profiles` and `tasks` tables, Row Level
  Security, and the auto-create-profile trigger are all set up and live in
  your Supabase project.
- ⚠️ **Backend ↔ Supabase connection** — `backend/main.py` still reads and
  writes to in-memory Python dictionaries, *not* the Supabase tables. This
  means every account and task disappears whenever the backend restarts
  (including every deploy on Render). The tables are ready and waiting;
  the backend code just needs its `# DB:` comments turned into real
  `supabase-py` calls.

## Deployment (free)

- **Backend** → Render (free Web Service, sleeps after 15 min idle)
- **Frontend** → Vercel (free static hosting)
- **Database/Auth** → Supabase (free project)

Remember to:
1. Set `FRONTEND_ORIGIN` on Render to your live Vercel URL (CORS)
2. Set `VITE_API_URL` on Vercel to your live Render URL
3. Add your Vercel URL to Supabase's Authentication → URL Configuration

## Roadmap

- Wire `backend/main.py` to Supabase so data survives restarts/deploys
- Add password hashing / session handling via Supabase Auth (currently a
  simplified email/password check)
- Have "Rejoin"/"Continue Battle" resume the exact subtask left off on,
  not just reopen the task
