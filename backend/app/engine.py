from __future__ import annotations

from typing import Dict, Any, List, Optional
import uuid

from .data import list_teams, get_team
from . import templates

# In-memory storage for MVP
SESSIONS: Dict[str, Dict[str, Any]] = {}

# Use a URL-safe delimiter for instance ids
DELIM = "__"


def create_session() -> Dict[str, Any]:
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = {
        "session_id": session_id,
        "status": "IN_PROGRESS",
        "answers": {},
        "meta": {},
        "plan": [
            {"instance_id": "intro__1", "kind": "intro", "bindings": {}}
        ],
        "cursor": 0,
    }
    return SESSIONS[session_id]


def materialise_plan(session: Dict[str, Any], team_name: str) -> None:
    team = get_team(team_name)
    mentor_name = team.get("mentor_name", "")
    members = team.get("members", [])

    session["meta"] = {
        "team_name": team_name,
        "mentor_name": mentor_name,
        "members": members,
    }

    plan: List[Dict[str, Any]] = []

    # fixed blocks
    plan.append({"instance_id": f"intro{DELIM}1", "kind": "intro", "bindings": {}})
    plan.append({"instance_id": f"mentor_confirmation{DELIM}1", "kind": "mentor_confirmation", "bindings": {}})
    plan.append({"instance_id": f"overall_performance{DELIM}1", "kind": "overall_performance", "bindings": {}})
    plan.append({"instance_id": f"client_communication{DELIM}1", "kind": "client_communication", "bindings": {}})

    # repeated member blocks
    for m in members:
        member_id = m.get("id")
        member_name = m.get("name")
        if not member_id or not member_name:
            # Skip malformed roster entries rather than crashing the whole session
            continue

        plan.append(
            {
                "instance_id": f"member_evaluation{DELIM}{member_id}",
                "kind": "member_evaluation",
                "bindings": {"member_id": member_id, "member_name": member_name},
            }
        )

    # final
    plan.append({"instance_id": f"director_comment{DELIM}1", "kind": "director_comment", "bindings": {}})

    session["plan"] = plan

    # cursor points to the next instance after intro
    # intro is always index 0
    session["cursor"] = 1


def render_instance(session: Dict[str, Any], instance: Dict[str, Any]) -> Dict[str, Any]:
    kind = instance["kind"]
    meta = session.get("meta", {})
    team_name = meta.get("team_name", "")
    mentor_name = meta.get("mentor_name", "")

    if kind == "intro":
        block = templates.intro_block(list_teams())
    elif kind == "mentor_confirmation":
        block = templates.mentor_confirmation_block(team_name, mentor_name)
    elif kind == "overall_performance":
        block = templates.overall_performance_block(team_name)
    elif kind == "client_communication":
        block = templates.client_communication_block(team_name)
    elif kind == "member_evaluation":
        member_name = instance["bindings"]["member_name"]
        block = templates.member_evaluation_block(member_name)
    elif kind == "director_comment":
        block = templates.director_comment_block(team_name)
    else:
        raise ValueError(f"Unknown instance kind: {kind}")

    existing = session["answers"].get(instance["instance_id"], {})

    return {
        "instance_id": instance["instance_id"],
        "title": block["title"],
        "elements": block["elements"],
        "answers": existing,
    }


def next_instance(session: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    plan = session.get("plan") or []
    cursor = int(session.get("cursor", 0))
    if cursor < 0:
        cursor = 0
        session["cursor"] = 0
    if cursor >= len(plan):
        return None
    return plan[cursor]
