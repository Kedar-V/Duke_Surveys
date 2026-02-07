from __future__ import annotations

import json
import os
import re
import uuid
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_FRONTEND_DATA = ROOT / "frontend" / "src" / "data" / "projectsCatalog.js"
FRONTEND_DATA = Path(os.environ.get("FRONTEND_DATA_PATH", DEFAULT_FRONTEND_DATA))
OUTPUT_SQL = Path(__file__).resolve().with_name("seed_projects.sql")

UUID_NAMESPACE = uuid.NAMESPACE_URL


def stable_uuid(*parts: str) -> uuid.UUID:
    return uuid.uuid5(UUID_NAMESPACE, "|".join(parts))


def load_projects() -> list[dict[str, Any]]:
    if not FRONTEND_DATA.exists():
        raise FileNotFoundError(
            f"Frontend data file not found at {FRONTEND_DATA}. "
            "Set FRONTEND_DATA_PATH or mount the frontend data directory."
        )
    text = FRONTEND_DATA.read_text(encoding="utf-8")
    text = re.sub(r"^\s*//.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"export\s+const\s+projectsCatalog\s*=\s*", "", text, count=1)
    text = text.strip().rstrip(";")
    text = re.sub(r"([A-Za-z_][A-Za-z0-9_]*)\s*:", r"\"\1\":", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def sql_value(value: str | None) -> str:
    if value is None:
        return "NULL"
    return f"'{sql_escape(value)}'"


def insert_stmt(table: str, columns: Iterable[str], rows: Iterable[Iterable[str]]) -> str:
    cols = ", ".join(columns)
    values = ",\n".join(f"  ({', '.join(row)})" for row in rows)
    return f"INSERT INTO {table} ({cols}) VALUES\n{values}\nON CONFLICT DO NOTHING;\n"


def main() -> None:
    projects = load_projects()

    org_rows: dict[str, uuid.UUID] = {}
    domain_rows: dict[str, uuid.UUID] = {}
    skill_rows: dict[str, uuid.UUID] = {}
    tag_rows: dict[str, uuid.UUID] = {}

    project_rows: list[list[str]] = []
    project_domain_rows: list[list[str]] = []
    project_skill_rows: list[list[str]] = []
    project_tag_rows: list[list[str]] = []

    for project in projects:
        project_id = stable_uuid("project", project["id"])
        company = project["company"].strip()
        if company not in org_rows:
            org_rows[company] = stable_uuid("org", company)

        domain = project.get("domain")
        if domain:
            domain = domain.strip()
            if domain not in domain_rows:
                domain_rows[domain] = stable_uuid("domain", domain)

        tags = [t.strip() for t in project.get("tags", []) if t.strip()]
        for tag in tags:
            if tag not in skill_rows:
                skill_rows[tag] = stable_uuid("skill", tag)
            if tag not in tag_rows:
                tag_rows[tag] = stable_uuid("tag", tag)

        difficulty = project.get("difficulty")
        duration = project.get("duration")
        meta = project.get("meta", [])
        extra_tags = [difficulty, duration, *meta]
        for tag in [t for t in extra_tags if t]:
            label = str(tag).strip()
            if not label:
                continue
            if label not in tag_rows:
                tag_rows[label] = stable_uuid("tag", label)

        project_rows.append(
            [
                sql_value(str(project_id)),
                sql_value(str(org_rows[company])),
                sql_value(project["title"]),
                sql_value(project.get("summary") or ""),
                sql_value(project.get("summary") or ""),
                sql_value(None),
                sql_value("published"),
                sql_value("public"),
            ]
        )

        if domain:
            project_domain_rows.append(
                [sql_value(str(project_id)), sql_value(str(domain_rows[domain]))]
            )

        for tag in tags:
            project_skill_rows.append(
                [sql_value(str(project_id)), sql_value(str(skill_rows[tag]))]
            )
            project_tag_rows.append(
                [sql_value(str(project_id)), sql_value(str(tag_rows[tag]))]
            )

        for tag in [t for t in extra_tags if t]:
            label = str(tag).strip()
            if not label:
                continue
            project_tag_rows.append(
                [sql_value(str(project_id)), sql_value(str(tag_rows[label]))]
            )

    statements: list[str] = ["BEGIN;\n"]

    statements.append(
        insert_stmt(
            "organizations",
            ["id", "name", "industry", "website"],
            [
                [sql_value(str(org_id)), sql_value(name), "NULL", "NULL"]
                for name, org_id in sorted(org_rows.items())
            ],
        )
    )

    statements.append(
        insert_stmt(
            "technical_domains",
            ["id", "name"],
            [[sql_value(str(domain_id)), sql_value(name)] for name, domain_id in sorted(domain_rows.items())],
        )
    )

    statements.append(
        insert_stmt(
            "skills",
            ["id", "name"],
            [[sql_value(str(skill_id)), sql_value(name)] for name, skill_id in sorted(skill_rows.items())],
        )
    )

    statements.append(
        insert_stmt(
            "tags",
            ["id", "name"],
            [[sql_value(str(tag_id)), sql_value(name)] for name, tag_id in sorted(tag_rows.items())],
        )
    )

    statements.append(
        insert_stmt(
            "projects",
            [
                "id",
                "org_id",
                "title",
                "summary",
                "description",
                "scope_clarity",
                "status",
                "visibility",
            ],
            project_rows,
        )
    )

    if project_domain_rows:
        statements.append(
            insert_stmt(
                "project_domains",
                ["project_id", "domain_id"],
                project_domain_rows,
            )
        )

    if project_skill_rows:
        statements.append(
            insert_stmt(
                "project_skills",
                ["project_id", "skill_id"],
                project_skill_rows,
            )
        )

    if project_tag_rows:
        statements.append(
            insert_stmt(
                "project_tags",
                ["project_id", "tag_id"],
                project_tag_rows,
            )
        )

    statements.append("COMMIT;\n")

    OUTPUT_SQL.write_text("\n".join(statements), encoding="utf-8")


if __name__ == "__main__":
    main()
