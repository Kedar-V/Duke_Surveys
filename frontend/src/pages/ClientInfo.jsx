import React, { useState } from "react";
import { submitClientIntake } from "../api.js";

const INDUSTRIES = [
  "Healthcare",
  "Finance",
  "Retail",
  "E Commerce",
  "Climate",
  "Sustainability",
  "Education",
  "Manufacturing",
  "Technology",
  "Energy",
  "Mobility",
  "Media",
  "Real Estate",
  "Government",
  "Agriculture",
  "Sports"
];


const SECTORS = [
  "Healthcare",
  "Finance",
  "Retail / E-commerce",
  "Climate / Sustainability",
  "Public Sector / Gov",
  "Education",
  "Manufacturing",
  "Energy / Utilities",
  "Transportation / Mobility",
  "Logistics / Supply Chain",
  "Media / Entertainment",
  "Telecommunications",
  "Real Estate / PropTech",
  "Agriculture / FoodTech",
  "Social Impact / Nonprofit",
  "Insurance",
  "Travel / Hospitality",
  "Sports / Fitness",
  "Cybersecurity",
  "Biotech / Life Sciences",
  "AdTech / MarTech",
  "FinTech",
  "HealthTech",
  "EdTech",
];

const TECH_DOMAINS = [
  "AI/ML",
  "Data Engineering",
  "Analytics",
  "Web Development",
  "Mobile Development",
  "Cloud & DevOps",
  "Product Innovation",
  "UX/UI Design",
  "Cybersecurity",
  "Data Visualization",
  "Business Intelligence",
  "MLOps",
  "NLP",
  "Computer Vision",
  "IoT / Edge",
  "FinTech",
  "HealthTech",
  "ClimateTech",
  "EduTech",
  "AdTech",
  "MarTech",
  "GovTech / Civic Tech",
  "Supply Chain / Logistics",
  "E-commerce",
  "Gaming / Media",
];

const SKILLS = [
  "Python",
  "SQL",
  "Machine Learning",
  "NLP",
  "Statistics",
  "Data Visualization",
  "Data Engineering",
  "Cloud (AWS/GCP/Azure)",
  "APIs / Integration",
  "ETL / ELT",
  "Product Management",
  "UX Research",
  "Project Management",
];

const SCOPE = ["well defined", "partially defined", "exploratory"];
const OTHER_OPTION = "__other__";

function MultiSelect({ options, value, onChange, label, otherValue, onOtherChange }) {
  const showOther = value.includes(OTHER_OPTION);

  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={(e) =>
          onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))
        }
        className="select-base"
        multiple
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={OTHER_OPTION}>Other</option>
      </select>
      {showOther && (
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Enter a custom option"
          className="input-base mt-2"
        />
      )}
    </div>
  );
}

function ClientInfo() {
  const [form, setForm] = useState({
    company_name: "",
    company_industry: "",
    company_industry_other: "",
    company_website: "",
    contact_name: "",
    contact_email: "",
    project_title: "",
    project_summary: "",
    project_description: "",
    minimum_deliverables: "",
    stretch_goals: "",
    long_term_impact: "",
    scope_clarity: "",
    scope_clarity_other: "",
    publication_potential: "",
    required_skills: [],
    required_skills_other: "",
    technical_domains: [],
    technical_domains_other: "",
    data_access: "",
    project_sector: "",
    project_sector_other: "",
    supplementary_documents: [],
    video_links: [""],
  });

  const [page, setPage] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [pendingSupplementaryFile, setPendingSupplementaryFile] = useState(null);

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

  function handleSupplementaryFileChange(e) {
    const file = e.target.files?.[0] || null;
    setPendingSupplementaryFile(file);
    e.target.value = "";
  }

  function addSupplementaryFile() {
    if (!pendingSupplementaryFile) return;
    setForm((f) => ({
      ...f,
      supplementary_documents: [...f.supplementary_documents, pendingSupplementaryFile],
    }));
    setPendingSupplementaryFile(null);
  }

  function removeSupplementaryFile(idx) {
    setForm((f) => ({
      ...f,
      supplementary_documents: f.supplementary_documents.filter((_, i) => i !== idx),
    }));
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
      if (form.company_industry === OTHER_OPTION && !form.company_industry_other.trim()) {
        e.company_industry_other = "Please specify the industry";
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
      if (form.project_summary.length > 300) {
        e.project_summary = "Max 300 chars";
      }
      if (
        !form.project_description ||
        form.project_description.length > 5000
      ) {
        e.project_description = "Required, max 5000 chars";
      }
      const parsedOutcomes = form.minimum_deliverables
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
      if (parsedOutcomes.length < 1 || parsedOutcomes.length > 5) {
        e.minimum_deliverables = "Required";
      }
      const parsedDeliverables = form.stretch_goals
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
      if (parsedDeliverables.length > 10) {
        e.stretch_goals = "Max 10 items";
      }
      const parsedSuccessCriteria = form.long_term_impact
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
      if (parsedSuccessCriteria.length > 10) {
        e.long_term_impact = "Max 10 items";
      }
      if (!form.scope_clarity) {
        e.scope_clarity = "Required";
      }
      if (!form.publication_potential) {
        e.publication_potential = "Required";
      }
    }

    if (pageIdx === 3) {
      // Example: could enforce at least one of skill/domain
      // if (!form.required_skills.length && !form.technical_domains.length) {
      //   e.required_skills = "Select at least one skill or domain";
      // }
    }

    if (pageIdx === 3) {
      if (!form.project_sector) {
        e.project_sector = "Required";
      }
      if (form.project_sector === OTHER_OPTION && !form.project_sector_other.trim()) {
        e.project_sector_other = "Please specify the sector";
      }
      if (!form.data_access) {
        e.data_access = "Required";
      }
      if (form.required_skills.includes(OTHER_OPTION) && !form.required_skills_other.trim()) {
        e.required_skills_other = "Please specify the skill";
      }
      if (form.technical_domains.includes(OTHER_OPTION) && !form.technical_domains_other.trim()) {
        e.technical_domains_other = "Please specify the domain";
      }
    }

    if (pageIdx === 4) {
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

    const normalizedSkills = form.required_skills
      .filter((v) => v !== OTHER_OPTION)
      .concat(
        form.required_skills.includes(OTHER_OPTION) && form.required_skills_other.trim()
          ? [form.required_skills_other.trim()]
          : []
      );
    const normalizedDomains = form.technical_domains
      .filter((v) => v !== OTHER_OPTION)
      .concat(
        form.technical_domains.includes(OTHER_OPTION) && form.technical_domains_other.trim()
          ? [form.technical_domains_other.trim()]
          : []
      );

    const payload = {
      ...form,
      company_industry:
        form.company_industry === OTHER_OPTION
          ? form.company_industry_other.trim()
          : form.company_industry,
      project_sector:
        form.project_sector === OTHER_OPTION
          ? form.project_sector_other.trim()
          : form.project_sector,
      scope_clarity: form.scope_clarity,
      publication_potential: form.publication_potential,
      required_skills: normalizedSkills,
      technical_domains: normalizedDomains,
      minimum_deliverables: form.minimum_deliverables,
      stretch_goals: form.stretch_goals,
      long_term_impact: form.long_term_impact,
      supplementary_documents: form.supplementary_documents.map((f) => f.name),
      video_links: form.video_links.map((v) => v.trim()).filter(Boolean),
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    form.supplementary_documents.forEach((file) => {
      formData.append("documents", file);
    });

    setSubmitting(true);
    setSubmitError(null);

    submitClientIntake(formData)
      .then(() => setSubmitted(true))
      .catch((err) => setSubmitError(String(err)))
      .finally(() => setSubmitting(false));
  }

  const pages = [
    // 0: Corporate Entity Details
    <>
      <h2 className="section-title">1. Corporate Entity Details</h2>

      <label className="label">Organisation Name*</label>
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

      <label className="label">Organisation Industry*</label>
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
        <option value={OTHER_OPTION}>Other</option>
      </select>
      {errors.company_industry && (
        <div className="error-text">{errors.company_industry}</div>
      )}
      {form.company_industry === OTHER_OPTION && (
        <>
          <input
            name="company_industry_other"
            value={form.company_industry_other}
            onChange={handleChange}
            placeholder="Enter industry"
            className="input-base mt-2"
          />
          {errors.company_industry_other && (
            <div className="error-text">{errors.company_industry_other}</div>
          )}
        </>
      )}

      <label className="label">Organisation Website</label>
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

      <label className="label">Contact Name*</label>
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

      <label className="label">Contact Email*</label>
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

      <label className="label">Project Title*</label>
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

      <label className="label">Project Summary</label>
      <textarea
        name="project_summary"
        value={form.project_summary}
        onChange={handleChange}
        maxLength={300}
        className="textarea-base"
      />
      <div
        className={
          form.project_summary.length > 300
            ? "text-sm text-red-700"
            : "text-sm text-slate-500"
        }
      >
        {form.project_summary.length}/300
      </div>
      {errors.project_summary && (
        <div className="error-text">{errors.project_summary}</div>
      )}

      <label className="label">Project Description*</label>
      <textarea
        name="project_description"
        value={form.project_description}
        onChange={handleChange}
        maxLength={5000}
        className="textarea-base"
      />
      <div
        className={
          form.project_description.length > 5000
            ? "text-sm text-red-700"
            : "text-sm text-slate-500"
        }
      >
        {form.project_description.length}/5000
      </div>
      {errors.project_description && (
        <div className="error-text">{errors.project_description}</div>
      )}

      <label className="label">Minimum Achievable deliverables within timeline*</label>
      <textarea
        name="minimum_deliverables"
        value={form.minimum_deliverables}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Enter"
      />
      {errors.minimum_deliverables && (
        <div className="error-text">{errors.minimum_deliverables}</div>
      )}

      <label className="label">
        Stretch goals that modestly exceed baseline expectations while remaining feasible (optional)
      </label>
      <textarea
        name="stretch_goals"
        value={form.stretch_goals}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Enter"
      />
      {errors.stretch_goals && (
        <div className="error-text">{errors.stretch_goals}</div>
      )}

      <label className="label">
        Significant contributions that extend beyond the project scope to drive long-term
        innovation and impact
      </label>
      <textarea
        name="long_term_impact"
        value={form.long_term_impact}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Enter"
      />
      {errors.long_term_impact && (
        <div className="error-text">{errors.long_term_impact}</div>
      )}

      <label className="label">
        Would you characterise your project as well defined with specific steps, or as exploratory with open ended goals?*
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

      <label className="label">
        Publication Potential: Kindly specify whether this project is anticipated to lead to a
        research publication. There is no expectation or requirement for such an outcome.*
      </label>
      <select
        name="publication_potential"
        value={form.publication_potential}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
        <option value="unsure">Unsure</option>
      </select>
      {errors.publication_potential && (
        <div className="error-text">{errors.publication_potential}</div>
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
        otherValue={form.required_skills_other}
        onOtherChange={(v) => setForm((f) => ({ ...f, required_skills_other: v }))}
      />
      {errors.required_skills_other && (
        <div className="error-text">{errors.required_skills_other}</div>
      )}

      <MultiSelect
        options={TECH_DOMAINS}
        value={form.technical_domains}
        onChange={(v) => setForm((f) => ({ ...f, technical_domains: v }))}
        label="Technical Domains"
        otherValue={form.technical_domains_other}
        onOtherChange={(v) => setForm((f) => ({ ...f, technical_domains_other: v }))}
      />
      {errors.technical_domains_other && (
        <div className="error-text">{errors.technical_domains_other}</div>
      )}

      <label className="label">Project Sector (Industry Domain)*</label>
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
        <option value={OTHER_OPTION}>Other</option>
      </select>
      {errors.project_sector && (
        <div className="error-text">{errors.project_sector}</div>
      )}
      {form.project_sector === OTHER_OPTION && (
        <>
          <input
            name="project_sector_other"
            value={form.project_sector_other}
            onChange={handleChange}
            placeholder="Enter sector"
            className="input-base mt-2"
          />
          {errors.project_sector_other && (
            <div className="error-text">{errors.project_sector_other}</div>
          )}
        </>
      )}

      <label className="label">Data Access*</label>
      <textarea
        name="data_access"
        value={form.data_access}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Describe data assets, access methodology, and restrictions"
      />
      {errors.data_access && (
        <div className="error-text">{errors.data_access}</div>
      )}

      {errors.required_skills && (
        <div className="error-text">{errors.required_skills}</div>
      )}
    </>,

    // 4: Supplementary Materials
    <>
      <h2 className="section-title">5. Supplementary Materials</h2>

      <label className="label">Supplementary Documents</label>
      <p className="muted">
        You may upload any supporting materials that help our student team understand your
        project more effectively. Examples include PDFs, specification documents,
        presentations, data samples, or background briefs. Sharing these materials gives the
        team a clearer view of your goals, expected outcomes, and any existing work. This
        allows the students to prepare more thoroughly, ask better questions during the
        kickoff, and begin the engagement with a stronger foundation. Permitted formats
        include PDF, document files, and presentation files.
      </p>
      <input
        type="file"
        name="supplementary_documents"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.odt,.odp,.xls,.xlsx,.csv,.txt"
        onChange={handleSupplementaryFileChange}
        className="input-base"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={addSupplementaryFile}
          disabled={!pendingSupplementaryFile}
        >
          Add file
        </button>
        {pendingSupplementaryFile && (
          <span className="text-sm text-slate-600">
            {pendingSupplementaryFile.name}
          </span>
        )}
      </div>
      {form.supplementary_documents.length > 0 && (
        <ul className="space-y-2">
          {form.supplementary_documents.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="flex items-center gap-2">
              <span className="text-sm text-slate-700">{file.name}</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => removeSupplementaryFile(idx)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors.supplementary_documents && (
        <div className="error-text">
          {errors.supplementary_documents}
        </div>
      )}

      <label className="label">Introductory or Relevant Videos (Optional)</label>
      <p className="muted">
        You may share an optional link to an introductory video, a short overview of your
        organisation, or any relevant demonstration. A brief video often conveys context that
        is difficult to capture in text, and it helps the team understand your mission, your
        users, and the problem space. This enables the team to align more quickly with your
        vision and accelerates the early discovery process. Please ensure that the link is a
        valid URL.
      </p>
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
    <div className="min-h-screen bg-slate-50 px-4 py-10 relative">
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6">
        <img
          src="/assets/dukelogo.png"
          alt="Duke University"
          className="h-[clamp(2.5rem,12vw,6rem)] sm:h-[clamp(3.25rem,8vw,8rem)] md:h-[clamp(3.75rem,6vw,7.5rem)] w-auto max-w-[55vw] sm:max-w-[45vw] md:max-w-[35vw] object-contain"
        />
      </div>
      <div className="card max-w-3xl mx-auto p-8 mt-10 sm:mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading text-duke-900">
              Organisation Project Intake Form
            </h1>
            <p className="muted">
              Step {page + 1} of {pages.length}
            </p>
          </div>
          <div className="h-2 w-40 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-duke-700 transition-all"
              style={{
                width: `${((page + 1) / pages.length)* 100}%`,
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
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>

          {submitted && (
            <div className="success-text">
              Form submitted. 
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
