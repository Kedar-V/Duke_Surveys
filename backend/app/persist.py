from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import re

from pymongo import DESCENDING

from .mongo import get_mongo

def utcnow():
    return datetime.now(timezone.utc)

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s

def create_session_doc(session_id: str) -> None:
    db = get_mongo()
    now = utcnow()
    db.survey_sessions.update_one(
        {"session_id": session_id},
        {"$setOnInsert": {
            "session_id": session_id,
            "status": "IN_PROGRESS",
            "cursor": 0,
            "created_at": now,
            "updated_at": now,
            "submitted_at": None,
            "answers": {},
            "plan": [],
            "team_key": None,
            "team_name": None,
            "mentor_name_roster": None,
            "mentor_name_entered": None,
        }},
        upsert=True,
    )

def save_intro_and_materialise(
    session_id: str,
    team_name: str,
    mentor_name_roster: str,
    members: list[dict],
    plan: list[dict],
    answers_intro: dict,
) -> None:
    db = get_mongo()
    now = utcnow()

    team_key = slugify(team_name)

    db.survey_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "team_key": team_key,
            "team_name": team_name,
            "mentor_name_roster": mentor_name_roster,
            "answers.intro": answers_intro,
            "plan": plan,
            "cursor": 1,
            "updated_at": now,
        }},
        upsert=True,
    )

def save_instance_answers(session_id: str, instance_kind: str, instance_id: str, answers: dict, bindings: Optional[dict] = None) -> None:
    """
    Writes answers into the final schema under answers.<block>.
    - mentor_confirmation -> answers.mentor_confirmation
    - overall_performance -> answers.overall_performance
    - client_communication -> answers.client_communication
    - director_comment -> answers.director_comment
    - member_evaluation -> answers.member_evaluations.<member_id>
    """
    db = get_mongo()
    now = utcnow()

    set_ops: Dict[str, Any] = {"updated_at": now}

    if instance_kind == "mentor_confirmation":
        set_ops["answers.mentor_confirmation"] = answers

    elif instance_kind == "overall_performance":
        set_ops["answers.overall_performance"] = answers

    elif instance_kind == "client_communication":
        set_ops["answers.client_communication"] = answers

    elif instance_kind == "director_comment":
        set_ops["answers.director_comment"] = answers

    elif instance_kind == "member_evaluation":
        if not bindings or "member_id" not in bindings:
            # Do not break runtime; just store by instance_id as fallback
            set_ops[f"answers.member_evaluations.{instance_id}"] = answers
        else:
            mid = bindings["member_id"]
            set_ops[f"answers.member_evaluations.{mid}"] = answers

    elif instance_kind == "intro":
        # intro is handled by save_intro_and_materialise; keep safe fallback
        set_ops["answers.intro"] = answers

    else:
        # Unknown block kind: store under answers.misc.<instance_id>
        set_ops[f"answers.misc.{instance_id}"] = answers

    db.survey_sessions.update_one(
        {"session_id": session_id},
        {"$set": set_ops},
        upsert=True,
    )

def mark_complete(session_id: str) -> None:
    db = get_mongo()
    now = utcnow()
    db.survey_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"status": "COMPLETE", "updated_at": now}},
        upsert=True,
    )

def mark_submitted(session_id: str) -> None:
    db = get_mongo()
    now = utcnow()
    db.survey_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"status": "SUBMITTED", "submitted_at": now, "updated_at": now}},
        upsert=True,
    )


def save_intake_form(payload: dict) -> str:
    db = get_mongo()
    now = utcnow()
    doc = {
        "raw": payload,
        "company": {
            "name": payload.get("company_name"),
            "industry": payload.get("company_industry"),
            "website": payload.get("company_website"),
        },
        "contact": {
            "name": payload.get("contact_name"),
            "email": payload.get("contact_email"),
        },
        "project": {
            "title": payload.get("project_title"),
            "summary": payload.get("project_summary"),
            "description": payload.get("project_description"),
            "minimum_deliverables": payload.get("minimum_deliverables", ""),
            "stretch_goals": payload.get("stretch_goals", ""),
            "long_term_impact": payload.get("long_term_impact", ""),
            "scope_clarity": payload.get("scope_clarity"),
            "publication_potential": payload.get("publication_potential"),
        },
        "competencies": {
            "required_skills": payload.get("required_skills", []),
            "technical_domains": payload.get("technical_domains", []),
            "data_access": payload.get("data_access"),
        },
        "sector": payload.get("project_sector"),
        "supplementary": {
            "documents": payload.get("supplementary_documents", []),
            "video_links": [str(v) for v in payload.get("video_links", [])],
        },
        "meta": {
            "source": "clientinfo",
            "created_at": now,
            "updated_at": now,
        },
    }
    res = db.client_intake_forms.insert_one(doc)
    if not res.acknowledged:
        raise RuntimeError("DocumentDB insert was not acknowledged")
    return str(res.inserted_id)


def get_latest_intakes(limit: int = 1) -> list[dict]:
    db = get_mongo()
    docs = list(
        db.client_intake_forms.find({})
        .sort([("meta.created_at", DESCENDING), ("_id", DESCENDING)])
        .limit(limit)
    )
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs
