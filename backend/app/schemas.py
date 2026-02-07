from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl
from enum import Enum


class ScopeClarity(str, Enum):
    well_defined = "well defined"
    partially_defined = "partially defined"
    exploratory = "exploratory"


class IntakeForm(BaseModel):
    company_name: str = Field(..., max_length=200)
    company_industry: str
    company_website: Optional[HttpUrl] = None

    contact_name: str = Field(..., max_length=100)
    contact_email: str

    project_title: str = Field(..., max_length=150)
    project_summary: Optional[str] = Field(default=None, max_length=300)
    project_description: str = Field(..., max_length=5000)
    expected_outcomes: List[str] = Field(..., min_items=1, max_items=5)
    deliverables: List[str] = Field(..., min_items=1, max_items=10)
    success_criteria: Optional[List[str]] = None
    scope_clarity: ScopeClarity

    required_skills: List[str] = Field(default_factory=list)
    technical_domains: List[str] = Field(default_factory=list)
    data_access: str

    project_sector: str

    supplementary_documents: List[str] = Field(default_factory=list)
    video_links: List[HttpUrl] = Field(default_factory=list)
