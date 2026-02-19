from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

class Base(DeclarativeBase):
    pass

class SessionRow(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default=text("'IN_PROGRESS'"))
    team_name: Mapped[str | None] = mapped_column(String, nullable=True)
    mentor_name: Mapped[str | None] = mapped_column(String, nullable=True)
    meta: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

class InstanceResponseRow(Base):
    __tablename__ = "instance_responses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    instance_id: Mapped[str] = mapped_column(String, nullable=False)
    kind: Mapped[str] = mapped_column(String, nullable=False)
    answers: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)


class ClientIntakeFormRow(Base):
    __tablename__ = "client_intake_forms"

    org_name: Mapped[str] = mapped_column(String, primary_key=True)
    raw: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    org_industry: Mapped[str | None] = mapped_column(String, nullable=True)
    org_industry_other: Mapped[str | None] = mapped_column(String, nullable=True)
    org_website: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String, nullable=True)
    project_title: Mapped[str | None] = mapped_column(String, nullable=True)
    project_summary: Mapped[str | None] = mapped_column(String, nullable=True)
    project_description: Mapped[str | None] = mapped_column(String, nullable=True)
    minimum_deliverables: Mapped[str | None] = mapped_column(String, nullable=True)
    stretch_goals: Mapped[str | None] = mapped_column(String, nullable=True)
    long_term_impact: Mapped[str | None] = mapped_column(String, nullable=True)
    scope_clarity: Mapped[str | None] = mapped_column(String, nullable=True)
    scope_clarity_other: Mapped[str | None] = mapped_column(String, nullable=True)
    publication_potential: Mapped[str | None] = mapped_column(String, nullable=True)
    required_skills: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    required_skills_other: Mapped[str | None] = mapped_column(String, nullable=True)
    technical_domains: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    data_access: Mapped[str | None] = mapped_column(String, nullable=True)
    project_sector: Mapped[str | None] = mapped_column(String, nullable=True)
    supplementary_documents: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    video_links: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    edit_token: Mapped[str | None] = mapped_column(String, nullable=True, unique=True)
    edit_url: Mapped[str | None] = mapped_column(String, nullable=True)
    revisions: Mapped[list] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
