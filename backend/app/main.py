from __future__ import annotations

import uuid
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import text
from sqlalchemy import update

from .engine import create_session, SESSIONS, materialise_plan, render_instance, next_instance
from .data import list_teams
from .db import get_db
from .models import SessionRow, InstanceResponseRow

app = FastAPI(title="Survey MVP")

# Local dev CORS (covers localhost + 127.0.0.1)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CreateSessionResponse(BaseModel):
    session_id: str
    teams: list[str]

class SaveAnswersRequest(BaseModel):
    answers: Dict[str, Any]

@app.get("/healthz")
def healthz(db: Session = Depends(get_db)):
    # Optional DB ping so health reflects DB readiness
    db.execute(text("select 1"))
    return {"ok": True}

def _upsert_instance_response(
    db: Session,
    session_id: uuid.UUID,
    instance_id: str,
    kind: str,
    answers: dict,
) -> None:
    stmt = (
        insert(InstanceResponseRow)
        .values(
            id=uuid.uuid4(),
            session_id=session_id,
            instance_id=instance_id,
            kind=kind,
            answers=answers,
        )
        .on_conflict_do_update(
            index_elements=["session_id", "instance_id"],
            set_={
                "answers": answers,
                "updated_at": text("now()"),
            },
        )
    )
    db.execute(stmt)

@app.post("/sessions", response_model=CreateSessionResponse)
def post_sessions(db: Session = Depends(get_db)):
    # Create in-memory session (flow state)
    s = create_session()

    # Persist minimal session row
    sid = uuid.UUID(s["session_id"])
    db.merge(SessionRow(id=sid, status="IN_PROGRESS", meta={}))
    db.commit()

    return {"session_id": s["session_id"], "teams": list_teams()}

@app.get("/sessions/{session_id}/instances/{instance_id}")
def get_instance(session_id: str, instance_id: str):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    # Always allow Intro, even if plan not materialised yet
    if instance_id == "intro__1":
        return render_instance(s, {"instance_id": "intro__1", "kind": "intro", "bindings": {}})

    inst = next((i for i in s.get("plan", []) if i["instance_id"] == instance_id), None)
    if not inst:
        raise HTTPException(404, "instance not found")

    return render_instance(s, inst)

@app.post("/sessions/{session_id}/instances/{instance_id}/answers")
def post_answers(session_id: str, instance_id: str, req: SaveAnswersRequest, db: Session = Depends(get_db)):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    # Merge into in-memory answers
    s["answers"][instance_id] = {**s["answers"].get(instance_id, {}), **req.answers}

    # Determine kind for persistence (intro special-case; others from plan)
    if instance_id == "intro__1":
        kind = "intro"
    else:
        inst = next((i for i in s.get("plan", []) if i["instance_id"] == instance_id), None)
        if not inst:
            raise HTTPException(404, "instance not found")
        kind = inst["kind"]

    # Persist answers (idempotent upsert)
    sid = uuid.UUID(session_id)
    _upsert_instance_response(db, sid, instance_id, kind, s["answers"][instance_id])

    # If intro submitted, materialise plan using ProjectTeam
    if instance_id == "intro__1":
        team = s["answers"][instance_id].get("ProjectTeam")
        if not team:
            db.rollback()
            raise HTTPException(400, "ProjectTeam is required")

        materialise_plan(s, team)

        # Persist session meta fields for reporting
        meta = s.get("meta", {})
        meta = s.get("meta", {})

        db.execute(
            update(SessionRow)
            .where(SessionRow.id == sid)
            .values(
                team_name=meta.get("team_name"),
                mentor_name=meta.get("mentor_name"),
                meta=meta,                 # dict is fine here
                updated_at=text("now()"),
            )
        )

    # Advance cursor if posting current step
    if s.get("plan"):
        current = next_instance(s)
        if current and current["instance_id"] == instance_id:
            s["cursor"] += 1
    else:
        # intro-only flow
        s["cursor"] = 1

    # Commit DB writes
    db.commit()

    nxt = next_instance(s) if s.get("plan") else None
    if nxt is None:
        # Mark session complete
        db.execute(text("update sessions set status='COMPLETE', updated_at=now() where id=:id"), {"id": sid})
        db.commit()
        return {"done": True}

    return {"next_instance_id": nxt["instance_id"]}

@app.post("/sessions/{session_id}/submit")
def submit(session_id: str, db: Session = Depends(get_db)):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    s["status"] = "SUBMITTED"
    sid = uuid.UUID(session_id)
    db.execute(text("update sessions set status='SUBMITTED', updated_at=now() where id=:id"), {"id": sid})
    db.commit()

    return {"status": "SUBMITTED"}

# --- small helper to safely write jsonb via text() update ---
import json
def json_dumps(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False)
