# A Diva Has Duties

**Break it. Do it. Done.** Your task, gamified into a legendary adventure.

🌐 **Live Website:** [https://a-diva-has-duties-1.onrender.com](https://a-diva-has-duties-1.onrender.com)

Type in what you need to get done. It gets broken into subtasks. Every
subtask you check off drains a monster's energy bar until it's defeated.
No penalty for an unfinished battle — the monster just waits for you to come back.

## Features

- Email/password sign up and login
- Pick a Diva Fighter (Witch Cat, Raccoon Baker, or Penguin Wizard)
- Type a task (or a whole messy schedule dump) and Gemini breaks it into
  3–6 concrete subtasks
- Each task spawns a random monster with its own energy bar
- Checking off subtasks drains the bar; hitting zero defeats the monster
- Unfinished tasks can be rejoined anytime from the game screen
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
├── frontend/          React app
├── backend/           FastAPI app
└── README.md          you are here
```

## Quickstart

### Live App
Play directly online: [https://a-diva-has-duties-1.onrender.com](https://a-diva-has-duties-1.onrender.com)

### Running Locally

```bash
# Terminal 1 — backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in your keys
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Status: what's real vs. what's scaffolded

Worth knowing before you show this to anyone or rely on it:

- ✅ **Frontend** — all screens are fully built and wired to the backend API.
- ✅ **AI subtasks** — real Gemini calls, with a generic fallback if no API
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

## Deployment

- **Live Web App** → [https://a-diva-has-duties-1.onrender.com](https://a-diva-has-duties-1.onrender.com)
- **Backend** → Render (free Web Service, sleeps after 15 min idle)
- **Database/Auth** → Supabase (free project)

## Roadmap

- Wire `backend/main.py` to Supabase so data survives restarts/deploys
- Add password hashing / session handling via Supabase Auth (currently a
  simplified email/password check)
- Have "Rejoin"/"Continue Battle" resume the exact subtask left off on,
  not just reopen the task
