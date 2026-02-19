from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
import re

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from .db import SessionLocal
from .models import ClientIntakeFormRow


class OrgAlreadyExistsError(Exception):
    pass


def utcnow():
    return datetime.now(timezone.utc)


def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def create_session_doc(session_id: str) -> None:
    return None


def save_intro_and_materialise(
    session_id: str,
    team_name: str,
    mentor_name_roster: str,
    members: list[dict],
    plan: list[dict],
    answers_intro: dict,
) -> None:
    return None


def save_instance_answers(
    session_id: str,
    instance_kind: str,
    instance_id: str,
    answers: dict,
    bindings: Optional[dict] = None,
) -> None:
    """
    Writes answers into the final schema under answers.<block>.
    - mentor_confirmation -> answers.mentor_confirmation
    - overall_performance -> answers.overall_performance
    - client_communication -> answers.client_communication
    - director_comment -> answers.director_comment
    - member_evaluation -> answers.member_evaluations.<member_id>
    """
    return None


def mark_complete(session_id: str) -> None:
    return None


def mark_submitted(session_id: str) -> None:
    return None


def save_intake_form(
    payload: dict, edit_token: Optional[str] = None, edit_url: Optional[str] = None
) -> str:
    db: Session = SessionLocal()
    now = utcnow()
    org_name = (payload.get("org_name") or "").strip()

    # If the org already exists, don't insert again.
    existing = (
        db.query(ClientIntakeFormRow)
        .filter(func.lower(ClientIntakeFormRow.org_name) == org_name.lower())
        .first()
    )
    if existing is not None:
        db.close()
        raise OrgAlreadyExistsError()

    row = ClientIntakeFormRow(
        org_name=org_name,
        raw=payload,
        org_industry=payload.get("org_industry"),
        org_industry_other=payload.get("org_industry_other"),
        org_website=payload.get("org_website"),
        contact_name=payload.get("contact_name"),
        contact_email=payload.get("contact_email"),
        project_title=payload.get("project_title"),
        project_summary=payload.get("project_summary"),
        project_description=payload.get("project_description"),
        minimum_deliverables=payload.get("minimum_deliverables"),
        stretch_goals=payload.get("stretch_goals"),
        long_term_impact=payload.get("long_term_impact"),
        scope_clarity=payload.get("scope_clarity"),
        scope_clarity_other=payload.get("scope_clarity_other"),
        publication_potential=payload.get("publication_potential"),
        required_skills=payload.get("required_skills", []),
        required_skills_other=payload.get("required_skills_other"),
        technical_domains=payload.get("technical_domains", []),
        data_access=payload.get("data_access"),
        project_sector=payload.get("project_sector"),
        supplementary_documents=payload.get("supplementary_documents", []),
        video_links=payload.get("video_links", []),
        edit_token=edit_token,
        edit_url=edit_url,
        revisions=[],
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    db.close()
    return str(row.org_name)


def get_intake_by_token(edit_token: str) -> Optional[dict]:
    db: Session = SessionLocal()
    row = (
        db.query(ClientIntakeFormRow)
        .filter(ClientIntakeFormRow.edit_token == edit_token)
        .first()
    )
    if not row:
        db.close()
        return None
    doc = {
        "id": str(row.org_name),
        "raw": row.raw,
        "edit_url": row.edit_url,
    }
    db.close()
    return doc


def update_intake_by_token(
    edit_token: str, payload: dict, uploaded_urls: Optional[list[str]] = None
) -> Optional[str]:
    db: Session = SessionLocal()
    now = utcnow()
    row = (
        db.query(ClientIntakeFormRow)
        .filter(ClientIntakeFormRow.edit_token == edit_token)
        .first()
    )
    if not row:
        db.close()
        return None

    existing_docs = payload.get("supplementary_documents", [])
    if uploaded_urls:
        payload["supplementary_documents"] = [*existing_docs, *uploaded_urls]

    revisions = list(row.revisions or [])
    revisions.append({"updated_at": now.isoformat(), "raw": row.raw})

    row.raw = payload
    row.org_name = payload.get("org_name")
    row.org_industry = payload.get("org_industry")
    row.org_industry_other = payload.get("org_industry_other")
    row.org_website = payload.get("org_website")
    row.contact_name = payload.get("contact_name")
    row.contact_email = payload.get("contact_email")
    row.project_title = payload.get("project_title")
    row.project_summary = payload.get("project_summary")
    row.project_description = payload.get("project_description")
    row.minimum_deliverables = payload.get("minimum_deliverables")
    row.stretch_goals = payload.get("stretch_goals")
    row.long_term_impact = payload.get("long_term_impact")
    row.scope_clarity = payload.get("scope_clarity")
    row.scope_clarity_other = payload.get("scope_clarity_other")
    row.publication_potential = payload.get("publication_potential")
    row.required_skills = payload.get("required_skills", [])
    row.required_skills_other = payload.get("required_skills_other")
    row.technical_domains = payload.get("technical_domains", [])
    row.data_access = payload.get("data_access")
    row.project_sector = payload.get("project_sector")
    row.supplementary_documents = payload.get("supplementary_documents", [])
    row.video_links = payload.get("video_links", [])
    row.revisions = revisions
    row.updated_at = now

    db.commit()
    db.refresh(row)
    db.close()
    return str(row.org_name)


def get_latest_intakes(limit: int = 1) -> list[dict]:
    db: Session = SessionLocal()
    rows = (
        db.query(ClientIntakeFormRow)
        .order_by(desc(ClientIntakeFormRow.created_at))
        .limit(limit)
        .all()
    )
    docs = []
    for row in rows:
        docs.append({"id": str(row.org_name), "raw": row.raw})
    db.close()
    return docs
