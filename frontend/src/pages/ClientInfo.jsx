import React, { useState } from "react";
import { submitClientIntake } from "../api.js";

const INDUSTRIES = [
  "Finance",
  "Healthcare",
  "Retail",
  "Climate",
  "Social Impact",
  "Education",
  "Manufacturing",
];

const SECTORS = [
  "Healthcare",
  "Finance",
  "Retail",
  "Climate",
  "Public Sector",
];

const CONFIDENTIALITY = [
  "None",
  "Non-Disclosure Agreement (NDA) required",
  "Intellectual Property (IP) agreement required",
];

const TECH_DOMAINS = [
  "AI/ML",
  "Data Engineering",
  "Web Development",
  "Analytics",
  "Project Management",
  "Product Innovation",
];

const SKILLS = [
  "Python",
  "SQL",
  "ML",
  "NLP",
  "Cloud",
  "Project Management",
  "UX",
];

const SCOPE = ["fully defined", "partially defined", "exploratory"];

function MultiSelect({ options, value, onChange, label }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      <select
        multiple
        value={value}
        onChange={(e) => {
          const vals = Array.from(e.target.selectedOptions, (o) => o.value);
          onChange(vals);
        }}
        className="select-base min-h-[60px]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ClientInfo() {
  const [form, setForm] = useState({
    company_name: "",
    company_industry: "",
    company_website: "",
    contact_name: "",
    contact_role: "",
    contact_email: "",
    project_title: "",
    project_summary_short: "",
    project_description_detailed: "",
    problem_statement: "",
    expected_outcomes: [""],
    deliverables: [""],
    success_criteria: [""],
    scope_clarity: "",
    required_skills: [],
    technical_domains: [],
    weekly_time_commitment: "",
    confidentiality_requirements: "",
    data_access: "",
    project_sector: "",
    supplementary_documents: [],
    video_links: [""],
  });

  const [page, setPage] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Generic change handler
  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((f) => ({
        ...f,
        [name]: Array.from(files || []),
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  }

  function addListItem(field, max) {
    setForm((f) => {
      const arr = f[field] || [];
      if (arr.length >= max) return f;
      return { ...f, [field]: [...arr, ""] };
    });
  }

  function handleListChange(field, idx, value) {
    setForm((f) => {
      const arr = [...(f[field] || [])];
      arr[idx] = value;
      return { ...f, [field]: arr };
    });
  }

  function removeListItem(field, idx, min) {
    setForm((f) => {
      const arr = [...(f[field] || [])];
      if (arr.length <= min) return f;
      arr.splice(idx, 1);
      return { ...f, [field]: arr };
    });
  }

  // Per-page validation
  function validate(pageIdx) {
    const e = {};

    if (pageIdx === 0) {
      if (!form.company_name || form.company_name.length > 200) {
        e.company_name = "Required, max 200 chars";
      }
      if (!form.company_industry) {
        e.company_industry = "Required";
      }
      if (
        form.company_website &&
        !/^https?:\/\/.+\..+/.test(form.company_website)
      ) {
        e.company_website = "Invalid URL";
      }
    }

    if (pageIdx === 1) {
      if (!form.contact_name || form.contact_name.length > 100) {
        e.contact_name = "Required, max 100 chars";
      }
      if (!form.contact_role || form.contact_role.length > 100) {
        e.contact_role = "Required, max 100 chars";
      }
      if (
        !form.contact_email ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contact_email)
      ) {
        e.contact_email = "Valid email required";
      }
    }

    if (pageIdx === 2) {
      if (!form.project_title || form.project_title.length > 150) {
        e.project_title = "Required, max 150 chars";
      }
      if (form.project_summary_short.length > 300) {
        e.project_summary_short = "Max 300 chars";
      }
      if (
        !form.project_description_detailed ||
        form.project_description_detailed.length > 5000
      ) {
        e.project_description_detailed = "Required, max 5000 chars";
      }
      if (
        form.expected_outcomes.filter((x) => x.trim()).length < 1 ||
        form.expected_outcomes.length > 5
      ) {
        e.expected_outcomes = "1–5 required";
      }
      if (
        form.deliverables.filter((x) => x.trim()).length < 1 ||
        form.deliverables.length > 10
      ) {
        e.deliverables = "1–10 required";
      }
      if (form.success_criteria.filter((x) => x.trim()).length < 1) {
        e.success_criteria = "At least 1 required";
      }
      if (!form.scope_clarity) {
        e.scope_clarity = "Required";
      }
    }

    if (pageIdx === 3) {
      // Example: could enforce at least one of skill/domain
      // if (!form.required_skills.length && !form.technical_domains.length) {
      //   e.required_skills = "Select at least one skill or domain";
      // }
    }

    if (pageIdx === 4) {
      const hours = Number(form.weekly_time_commitment);
      if (!hours || hours < 1 || hours > 15) {
        e.weekly_time_commitment = "1–15 required";
      }
      if (!form.confidentiality_requirements) {
        e.confidentiality_requirements = "Required";
      }
      if (!form.data_access) {
        e.data_access = "Required";
      }
    }

    if (pageIdx === 5) {
      if (!form.project_sector) {
        e.project_sector = "Required";
      }
    }

    if (pageIdx === 6) {
      if (form.supplementary_documents.length > 3) {
        e.supplementary_documents = "Max 3 files";
      }
      if (
        form.supplementary_documents.some((f) => f.size > 5 * 1024 * 1024)
      ) {
        e.supplementary_documents = "Max 5MB per file";
      }
      if (
        form.video_links.some((l) => l && !/^https?:\/\/.+\..+/.test(l))
      ) {
        e.video_links = "Invalid video link";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext(e) {
    e.preventDefault();
    if (!validate(page)) return;
    setErrors({});
    setPage((p) => p + 1);
  }

  function handleBack(e) {
    e.preventDefault();
    setErrors({});
    setPage((p) => p - 1);
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Full validation across all pages
    for (let i = 0; i < pages.length; i += 1) {
      if (!validate(i)) {
        setPage(i);
        return;
      }
    }

    const payload = {
      ...form,
      weekly_time_commitment: Number(form.weekly_time_commitment || 0),
      expected_outcomes: form.expected_outcomes
        .map((v) => v.trim())
        .filter(Boolean),
      deliverables: form.deliverables.map((v) => v.trim()).filter(Boolean),
      success_criteria: form.success_criteria
        .map((v) => v.trim())
        .filter(Boolean),
      supplementary_documents: form.supplementary_documents.map((f) => f.name),
      video_links: form.video_links.map((v) => v.trim()).filter(Boolean),
    };

    setSubmitting(true);
    setSubmitError(null);

    submitClientIntake(payload)
      .then(() => setSubmitted(true))
      .catch((err) => setSubmitError(String(err)))
      .finally(() => setSubmitting(false));
  }

  const pages = [
    // 0: Corporate Entity Details
    <>
      <h2 className="section-title">1. Corporate Entity Details</h2>

      <label className="label">Company Name *</label>
      <input
        name="company_name"
        value={form.company_name}
        onChange={handleChange}
        maxLength={200}
        className="input-base"
      />
      {errors.company_name && (
        <div className="error-text">{errors.company_name}</div>
      )}

      <label className="label">Company Industry *</label>
      <select
        name="company_industry"
        value={form.company_industry}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        {INDUSTRIES.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
      {errors.company_industry && (
        <div className="error-text">{errors.company_industry}</div>
      )}

      <label className="label">Company Website</label>
      <input
        name="company_website"
        value={form.company_website}
        onChange={handleChange}
        className="input-base"
      />
      {errors.company_website && (
        <div className="error-text">{errors.company_website}</div>
      )}
    </>,

    // 1: Primary Point of Contact
    <>
      <h2 className="section-title">2. Primary Point of Contact</h2>

      <label className="label">Contact Name *</label>
      <input
        name="contact_name"
        value={form.contact_name}
        onChange={handleChange}
        maxLength={100}
        className="input-base"
      />
      {errors.contact_name && (
        <div className="error-text">{errors.contact_name}</div>
      )}

      <label className="label">Contact Role *</label>
      <input
        name="contact_role"
        value={form.contact_role}
        onChange={handleChange}
        maxLength={100}
        className="input-base"
      />
      {errors.contact_role && (
        <div className="error-text">{errors.contact_role}</div>
      )}

      <label className="label">Contact Email *</label>
      <input
        name="contact_email"
        value={form.contact_email}
        onChange={handleChange}
        className="input-base"
      />
      {errors.contact_email && (
        <div className="error-text">{errors.contact_email}</div>
      )}
    </>,

    // 2: Project Specification
    <>
      <h2 className="section-title">3. Project Specification</h2>

      <label className="label">Project Title *</label>
      <input
        name="project_title"
        value={form.project_title}
        onChange={handleChange}
        maxLength={150}
        className="input-base"
      />
      {errors.project_title && (
        <div className="error-text">{errors.project_title}</div>
      )}

      <label className="label">Project Summary (Short, max 300 chars)</label>
      <textarea
        name="project_summary_short"
        value={form.project_summary_short}
        onChange={handleChange}
        maxLength={300}
        className="textarea-base"
      />
      {errors.project_summary_short && (
        <div className="error-text">{errors.project_summary_short}</div>
      )}

      <label className="label">Project Description (Detailed) *</label>
      <textarea
        name="project_description_detailed"
        value={form.project_description_detailed}
        onChange={handleChange}
        maxLength={5000}
        className="textarea-base"
      />
      {errors.project_description_detailed && (
        <div className="error-text">
          {errors.project_description_detailed}
        </div>
      )}

      <label className="label">Problem Statement</label>
      <textarea
        name="problem_statement"
        value={form.problem_statement}
        onChange={handleChange}
        className="textarea-base"
      />

      <label className="label">Expected Outcomes (1–5)</label>
      {form.expected_outcomes.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={v}
            onChange={(e) =>
              handleListChange("expected_outcomes", i, e.target.value)
            }
            className="input-base"
          />
          {form.expected_outcomes.length > 1 && (
            <button
              type="button"
              onClick={() =>
                removeListItem("expected_outcomes", i, 1)
              }
            >
              -
            </button>
          )}
          {form.expected_outcomes.length < 5 &&
            i === form.expected_outcomes.length - 1 && (
              <button
                type="button"
                onClick={() => addListItem("expected_outcomes", 5)}
              >
                +
              </button>
            )}
        </div>
      ))}
      {errors.expected_outcomes && (
        <div className="error-text">{errors.expected_outcomes}</div>
      )}

      <label className="label">Deliverables (1–10)</label>
      {form.deliverables.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={v}
            onChange={(e) =>
              handleListChange("deliverables", i, e.target.value)
            }
            className="input-base"
          />
          {form.deliverables.length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem("deliverables", i, 1)}
            >
              -
            </button>
          )}
          {form.deliverables.length < 10 &&
            i === form.deliverables.length - 1 && (
              <button
                type="button"
                onClick={() => addListItem("deliverables", 10)}
              >
                +
              </button>
            )}
        </div>
      ))}
      {errors.deliverables && (
        <div className="error-text">{errors.deliverables}</div>
      )}

      <label className="label">Success Criteria (min 1)</label>
      {form.success_criteria.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={v}
            onChange={(e) =>
              handleListChange("success_criteria", i, e.target.value)
            }
            className="input-base"
          />
          {form.success_criteria.length > 1 && (
            <button
              type="button"
              onClick={() =>
                removeListItem("success_criteria", i, 1)
              }
            >
              -
            </button>
          )}
          {i === form.success_criteria.length - 1 && (
            <button
              type="button"
              onClick={() => addListItem("success_criteria", 10)}
            >
              +
            </button>
          )}
        </div>
      ))}
      {errors.success_criteria && (
        <div className="error-text">{errors.success_criteria}</div>
      )}

      <label className="label">
        Is it exploratory or more well defined?
      </label>
      <select
        name="scope_clarity"
        value={form.scope_clarity}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        {SCOPE.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {errors.scope_clarity && (
        <div className="error-text">{errors.scope_clarity}</div>
      )}
    </>,

    // 3: Required Competencies & Technologies
    <>
      <h2 className="section-title">4. Required Competencies and Technologies</h2>

      <MultiSelect
        options={SKILLS}
        value={form.required_skills}
        onChange={(v) => setForm((f) => ({ ...f, required_skills: v }))}
        label="Required Skills"
      />

      <MultiSelect
        options={TECH_DOMAINS}
        value={form.technical_domains}
        onChange={(v) => setForm((f) => ({ ...f, technical_domains: v }))}
        label="Technical Domains"
      />

      {errors.required_skills && (
        <div className="error-text">{errors.required_skills}</div>
      )}
    </>,

    // 4: Project Management and Logistics
    <>
      <h2 className="section-title">5. Project Management and Logistics</h2>

      <label className="label">
        Weekly Time Commitment (hours, 1–15) *
      </label>
      <input
        type="number"
        name="weekly_time_commitment"
        value={form.weekly_time_commitment}
        onChange={handleChange}
        min={1}
        max={15}
        className="input-base"
      />
      {errors.weekly_time_commitment && (
        <div className="error-text">
          {errors.weekly_time_commitment}
        </div>
      )}

      <label className="label">Confidentiality Requirements *</label>
      <select
        name="confidentiality_requirements"
        value={form.confidentiality_requirements}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        {CONFIDENTIALITY.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {errors.confidentiality_requirements && (
        <div className="error-text">
          {errors.confidentiality_requirements}
        </div>
      )}

      <label className="label">Data Access *</label>
      <textarea
        name="data_access"
        value={form.data_access}
        onChange={handleChange}
        className="textarea-base"
      />
      {errors.data_access && (
        <div className="error-text">{errors.data_access}</div>
      )}
    </>,

    // 5: Sectoral Classification
    <>
      <h2 className="section-title">6. Sectoral Classification</h2>

      <label className="label">Project Sector *</label>
      <select
        name="project_sector"
        value={form.project_sector}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        {SECTORS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {errors.project_sector && (
        <div className="error-text">{errors.project_sector}</div>
      )}
    </>,

    // 6: Supplementary Materials
    <>
      <h2 className="section-title">7. Supplementary Materials</h2>

      <label className="label">
        Supplementary Documents (max 3, 5MB each, PDF/DOC/PPT)
      </label>
      <input
        type="file"
        name="supplementary_documents"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.odt,.odp,.xls,.xlsx,.csv,.txt"
        onChange={handleChange}
        className="input-base"
      />
      {errors.supplementary_documents && (
        <div className="error-text">
          {errors.supplementary_documents}
        </div>
      )}

      <label className="label">
        Intro or Relevant Video Links (optional)
      </label>
      {form.video_links.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={v}
            onChange={(e) =>
              handleListChange("video_links", i, e.target.value)
            }
            className="input-base"
          />
          {form.video_links.length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem("video_links", i, 1)}
            >
              -
            </button>
          )}
          {i === form.video_links.length - 1 && (
            <button
              type="button"
              onClick={() => addListItem("video_links", 10)}
            >
              +
            </button>
          )}
        </div>
      ))}
      {errors.video_links && (
        <div className="error-text">{errors.video_links}</div>
      )}
    </>,
  ];

  const isLastPage = page === pages.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="card max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading text-duke-900">
              Company Project Intake Form
            </h1>
            <p className="muted">
              Step {page + 1} of {pages.length}
            </p>
          </div>
          <div className="h-2 w-40 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-duke-700 transition-all"
              style={{
                width: `${((page + 1) / pages.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <form
          onSubmit={isLastPage ? handleSubmit : handleNext}
          noValidate
          className="space-y-6"
        >
          {pages[page]}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {page > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {!isLastPage ? (
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>

          {submitted && (
            <div className="success-text">
              Form submitted. API integration pending.
            </div>
          )}
          {submitError && (
            <div className="error-text">{submitError}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ClientInfo;
