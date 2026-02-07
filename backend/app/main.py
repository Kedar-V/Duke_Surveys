from __future__ import annotations

import json
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .engine import create_session, SESSIONS, materialise_plan, render_instance, next_instance
from .data import list_teams, get_team
from .mongo import ensure_indexes
from .persist import (
    create_session_doc,
    save_intro_and_materialise,
    save_instance_answers,
    mark_complete,
    mark_submitted,
    save_intake_form,
    get_latest_intakes,
)
from .schemas import IntakeForm
from .s3 import upload_documents

app = FastAPI(title="Survey MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Vite in Docker may appear as container IP in some setups; add if needed:
        # "http://172.19.0.4:5173",
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

@app.on_event("startup")
def startup():
    ensure_indexes()

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/sessions", response_model=CreateSessionResponse)
def post_sessions():
    s = create_session()
    # Persist minimal session doc (does not affect runtime if mongo is down)
    try:
        create_session_doc(s["session_id"])
    except Exception:
        # Do not break existing functionality; keep runtime in-memory working
        pass
    return {"session_id": s["session_id"], "teams": list_teams()}

@app.get("/sessions/{session_id}/instances/{instance_id}")
def get_instance(session_id: str, instance_id: str):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    if instance_id == "intro__1":
        return render_instance(s, {"instance_id": "intro__1", "kind": "intro", "bindings": {}})

    inst = next((i for i in s.get("plan", []) if i["instance_id"] == instance_id), None)
    if not inst:
        raise HTTPException(404, "instance not found")

    return render_instance(s, inst)

@app.post("/sessions/{session_id}/instances/{instance_id}/answers")
def post_answers(session_id: str, instance_id: str, req: SaveAnswersRequest):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    # Merge into in-memory answers
    s["answers"][instance_id] = {**s["answers"].get(instance_id, {}), **req.answers}

    # Resolve kind + bindings (for member_id persistence)
    if instance_id == "intro__1":
        kind = "intro"
        bindings = {}
    else:
        inst = next((i for i in s.get("plan", []) if i["instance_id"] == instance_id), None)
        if not inst:
            raise HTTPException(404, "instance not found")
        kind = inst["kind"]
        bindings = inst.get("bindings", {})

    # Intro: materialise plan and persist canonical session fields + plan in Mongo
    if instance_id == "intro__1":
        team_name = s["answers"][instance_id].get("ProjectTeam")
        if not team_name:
            raise HTTPException(400, "ProjectTeam is required")

        materialise_plan(s, team_name)

        # Build a Mongo-friendly plan list (stable, serialisable)
        plan = []
        for p in s.get("plan", []):
            item = {"instance_id": p["instance_id"], "kind": p["kind"]}
            if p["kind"] == "member_evaluation":
                b = p.get("bindings", {})
                if "member_id" in b:
                    item["member_id"] = b["member_id"]
            plan.append(item)

        meta = s.get("meta", {})
        mentor_name = meta.get("mentor_name", "")
        members = meta.get("members", [])

        try:
            save_intro_and_materialise(
                session_id=session_id,
                team_name=meta.get("team_name", team_name),
                mentor_name_roster=mentor_name,
                members=members,
                plan=plan,
                answers_intro=s["answers"][instance_id],
            )
        except Exception:
            # Do not break existing flow
            pass

    # Persist current instance answers into final schema paths
    try:
        save_instance_answers(
            session_id=session_id,
            instance_kind=kind,
            instance_id=instance_id,
            answers=s["answers"][instance_id],
            bindings=bindings,
        )
    except Exception:
        pass

    # Advance cursor if posting current step
    if s.get("plan"):
        current = next_instance(s)
        if current and current["instance_id"] == instance_id:
            s["cursor"] += 1
    else:
        s["cursor"] = 1

    nxt = next_instance(s) if s.get("plan") else None
    if nxt is None:
        try:
            mark_complete(session_id)
        except Exception:
            pass
        return {"done": True}

    return {"next_instance_id": nxt["instance_id"]}

@app.post("/sessions/{session_id}/submit")
def submit(session_id: str):
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, "session not found")

    s["status"] = "SUBMITTED"
    try:
        mark_submitted(session_id)
    except Exception:
        pass
    return {"status": "SUBMITTED"}


@app.post("/client-intake")
def create_client_intake(payload: IntakeForm):
    intake_id = save_intake_form(payload.model_dump(mode="json"))
    return {"id": intake_id}


@app.post("/client-intake/upload")
def create_client_intake_upload(
    payload: str = Form(...),
    documents: list[UploadFile] | None = File(None),
):
    try:
        payload_dict = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(400, "Invalid payload JSON") from exc

    intake = IntakeForm.model_validate(payload_dict)
    urls = upload_documents(documents or [])
    intake_payload = intake.model_dump(mode="json")
    if urls:
        intake_payload["supplementary_documents"] = urls

    intake_id = save_intake_form(intake_payload)
    return {"id": intake_id, "documents": urls}


@app.get("/client-intake/latest")
def get_latest_client_intake(limit: int = 1):
    return {"items": get_latest_intakes(limit=limit)}


from .mongo import ping

@app.get("/healthz")
def healthz():
    return {"ok": True, "mongo": ping()}
