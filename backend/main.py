import json
import random
import re
from typing import Optional

from google import genai
from google.genai import types
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, ValidationError
from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

try:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variable.")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"[ERROR] Failed to initialize Supabase client: {e}")
    supabase = None

app = FastAPI(title="A Diva Has Duties API")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "https://a-diva-has-duties-1.onrender.com")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

CHARACTERS = ["witch_cat", "raccoon_baker", "penguin_wizard"]

MONSTERS = [
    {"id": "beetle_bug", "name": "Beetle Bug"},
    {"id": "deadline_wraith", "name": "Deadline Wraith"},
    {"id": "clutter_golem", "name": "Clutter Golem"},
    {"id": "inbox_hydra", "name": "Inbox Hydra"},
]

@app.get("/health")
def health():
    return {"status": "ok"}

# ─── Auth helper ───────────────────────────────────────────────
async def get_current_user_id(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_resp.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")

# ─── Models ────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CharacterChoice(BaseModel):
    user_id: str
    character: str

class NewTaskRequest(BaseModel):
    user_id: str
    title: str

class CompleteSubtaskRequest(BaseModel):
    task_id: str
    subtask_index: int

# ─── Level curve ───────────────────────────────────────────────
def tasks_required_for_level(level: int) -> int:
    if level <= 10:
        return 2
    elif level <= 20:
        return 3
    return 5

# ─── Gemini subtask generation ─────────────────────────────────
SUBTASK_SYSTEM_PROMPT = """You break a single task or schedule dump into a
short checklist of concrete subtasks for a to-do app called "A Diva Has 
Duties". The user might type one task ("prep chemistry final") or a messy
block of several things they need to do today.

Rules:
- Return 3 to 6 subtasks. Fewer for a simple task , more for a busy schedule.
- Each subtask is a short , concrete, actionable line ( imperative mood e.g.
"Draft the outline", not "Outline needs to be drafted").
- If the input already lists multiple separate to-dos , turn each into its
own subtask rather than inventing generic planning steps.
- No numbering , no markdown , no extra commentary.
- Respond with Only a JSON array of strings. Example:
["Draft a mail", "Review the mail" , "send for second review to senior manage"]"""

def _fallback_subtasks(title: str) -> list[str]:
    return [
        f"Plan out: {title}",
        f"Do first pass on: {title}",
        f"Review/ Clean up: {title}",
    ]

def generate_subtasks(title: str) -> list[str]:
    title = title.strip()
    if not title:
        raise HTTPException(400, "Task title can't be empty")

    if not gemini_client:
        return _fallback_subtasks(title)

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-pro", 
            contents=title,
            config=types.GenerateContentConfig(
                system_instruction=SUBTASK_SYSTEM_PROMPT,
                max_output_tokens=300,
                response_mime_type="application/json",
            )
        )  
        raw = response.text.strip()
        subtasks = json.loads(raw)

        if not isinstance(subtasks, list) or not all(isinstance(s, str) for s in subtasks):
            return _fallback_subtasks(title)
        if len(subtasks) < 1:
            return _fallback_subtasks(title)
        return subtasks[:6]

    except Exception as e:
        print(f"[generate_subtasks] Gemini API call failed , using fallback: {e}")
        return _fallback_subtasks(title)

# ─── Auth endpoints ────────────────────────────────────────────
@app.post("/auth/signup")
def signup(req: SignupRequest):
    try:
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "name": req.name
                }
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Auth error: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Sign Up failed.")
    
    user_id = auth_response.user.id

    # The handle_new_user SQL trigger automatically creates a row in the profiles table.
    
    return {
        "user_id": user_id, 
        "name": req.name, 
        "level": 1,
        "access_token": auth_response.session.access_token if auth_response.session else None
    }

@app.post("/auth/login")
def login(req: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user_id = auth_response.user.id
    user_record = supabase.table("profiles").select("*").eq("id", user_id).execute()

    if not user_record.data:
        raise HTTPException(status_code=404, detail="User Profile not found in database. Please sign up again.")

    user_record = user_record.data[0]

    return {
        "user_id": user_id, 
        "access_token": auth_response.session.access_token,
        **user_record
    }

# ─── Character endpoints ──────────────────────────────────────
@app.get("/characters")
def list_characters():
    return {"characters": CHARACTERS}

@app.post("/user/character")
def choose_character(req: CharacterChoice, current_user_id: str = Depends(get_current_user_id)):
    if req.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this user")
        
    if req.character not in CHARACTERS:
        raise HTTPException(400, "Unknown Character")
    
    try:
        response = supabase.table("profiles").update({
            "character": req.character
        }).eq("id", req.user_id).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="User not found or update failed")

        return {"ok": True, "character": req.character}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ─── Task endpoints ───────────────────────────────────────────
@app.post("/tasks")
def create_task(req: NewTaskRequest, current_user_id: str = Depends(get_current_user_id)):
    if req.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create tasks for this user")

    user_res = supabase.table("profiles").select("*").eq("id", req.user_id).execute()

    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found")

    subtask_list = generate_subtasks(req.title)
    monster = random.choice(MONSTERS)

    try: 
        insert_res = supabase.table("tasks").insert({
            "user_id": req.user_id,
            "title": req.title,
            "subtasks": [{"text": s, "done": False} for s in subtask_list],
            "monster": monster,
            "energy": 100
        }).execute()

        if not insert_res.data:
            raise HTTPException(status_code=500, detail="Failed to create task.")

        return insert_res.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/tasks/{task_id}")
def get_task(task_id: str, current_user_id: str = Depends(get_current_user_id)):
    response = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", current_user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return response.data[0]

@app.get("/tasks")
def list_tasks(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these tasks")

    response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()

    return {"tasks": response.data}

@app.post("/tasks/complete_subtask")
def complete_subtask(req: CompleteSubtaskRequest, current_user_id: str = Depends(get_current_user_id)):
    task_res = supabase.table("tasks").select("*").eq("id", req.task_id).eq("user_id", current_user_id).execute()
    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")

    task = task_res.data[0]
    subtasks = task["subtasks"] or []

    if not (0 <= req.subtask_index < len(subtasks)):
        raise HTTPException(status_code=400, detail="Bad subtask index")

    already_done = bool(subtasks[req.subtask_index].get("done"))
    subtasks[req.subtask_index]["done"] = True

    total = len(subtasks)
    done_count = sum(1 for s in subtasks if s.get("done"))
    new_energy = max(0, round(100 * (total - done_count) / total)) if total else 0
    task_fully_done = done_count == total

    updated_task_res = supabase.table("tasks").update({
        "subtasks": subtasks,
        "energy": new_energy,
    }).eq("id", req.task_id).execute()

    if not updated_task_res.data:
        raise HTTPException(status_code=500, detail="Failed to update task in database.")

    updated_task = updated_task_res.data[0] 

    level_up = False
    user_data = None

    if task_fully_done and not already_done:
        user_res = supabase.table("profiles").select("*").eq("id", task["user_id"]).execute()

        if user_res.data:
            user = user_res.data[0]
            new_tasks_done = user["tasks_done_this_level"] + 1
            current_level = user["level"]
            required = tasks_required_for_level(current_level)

            if new_tasks_done >= required:
                current_level += 1
                new_tasks_done = 0
                level_up = True

            user_update_res = supabase.table("profiles").update({
                "level": current_level,
                "tasks_done_this_level": new_tasks_done,
                "last_defeated_monster": task.get("monster"),
            }).eq("id", user["id"]).execute()

            if user_update_res.data:
                user_data = user_update_res.data[0]
                user_data["user_id"] = user_data["id"]

    return {
        "task": updated_task,
        "task_fully_done": task_fully_done,
        "level_up": level_up,
        "user": user_data,
    }

@app.get("/")
def root():
    return {"status": "A Diva Has Duties API is running"}