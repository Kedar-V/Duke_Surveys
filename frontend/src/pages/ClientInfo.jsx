import React, { useEffect, useState } from "react";
import { submitClientIntake, getClientIntakeForEdit, updateClientIntake } from "../api.js";
import { useNavigate, useParams } from "react-router-dom";

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
const SKILLS = [
  "Python",
  "SQL",
  "Machine Learning",
  "Large Language Models",
  "Prompt Engineering",
  "NLP",
  "Statistical Analysis",
  "Data Visualization",
  "Data Engineering",
  "Data Modeling",
  "Marketing Analytics",
  "Advertising Analytics",
  "Cloud (AWS/GCP/Azure)",
  "APIs / Integration",
  "ETL / ELT",
  "Product Management",
  "Experimentation / A/B Testing",
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
      <p className="muted">Tip: On desktop use Cmd/Ctrl-click to select multiple.</p>
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
          placeholder="Other (e.g., Time-series forecasting)"
          className="input-base mt-2"
        />
      )}
    </div>
  );
}

function ClientInfo() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [form, setForm] = useState({
    org_name: "",
    org_industry: "",
    org_industry_other: "",
    org_website: "",
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
    technical_domains: "",
    data_access: "",
    supplementary_documents: [],
    video_links: [""],
  });

  const [page, setPage] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [pendingSupplementaryFile, setPendingSupplementaryFile] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

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
      if (!form.org_name || form.org_name.length > 200) {
        e.org_name = "Required, max 200 chars";
      }
      if (!form.org_industry) {
        e.org_industry = "Required";
      }
      if (form.org_industry === OTHER_OPTION && !form.org_industry_other.trim()) {
        e.org_industry_other = "Please specify the industry";
      }
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

    if (pageIdx === 1) {
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
      if (!form.minimum_deliverables || form.minimum_deliverables.length > 5000) {
        e.minimum_deliverables = "Required, max 5000 chars";
      }
      if (form.stretch_goals.length > 5000) {
        e.stretch_goals = "Max 5000 chars";
      }
      if (form.long_term_impact.length > 5000) {
        e.long_term_impact = "Max 5000 chars";
      }
      if (!form.scope_clarity) {
        e.scope_clarity = "Required";
      }
      if (!form.publication_potential) {
        e.publication_potential = "Required";
      }
    }

    if (pageIdx === 2) {
      // Example: could enforce at least one of skill/domain
      // if (!form.required_skills.length && !form.technical_domains.length) {
      //   e.required_skills = "Select at least one skill or domain";
      // }
    }

    if (pageIdx === 2) {
      if (!form.data_access) {
        e.data_access = "Required";
      }
      if (form.required_skills.includes(OTHER_OPTION) && !form.required_skills_other.trim()) {
        e.required_skills_other = "Please specify the skill";
      }
    }

    if (pageIdx === 3) {
      if (
        form.org_website &&
        !/^https?:\/\/.+\..+/.test(form.org_website)
      ) {
        e.org_website = "Invalid URL";
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

    const normalizedSkills = form.required_skills
      .filter((v) => v !== OTHER_OPTION)
      .concat(
        form.required_skills.includes(OTHER_OPTION) && form.required_skills_other.trim()
          ? [form.required_skills_other.trim()]
          : []
      );
    const normalizedDomains = Array.isArray(form.technical_domains)
      ? form.technical_domains
          .map((v) => String(v).trim())
          .filter(Boolean)
      : (typeof form.technical_domains === "string" ? form.technical_domains : "")
          .split(/\n|,/)
          .map((v) => v.trim())
          .filter(Boolean);

    const normalizedIndustry =
      form.org_industry === OTHER_OPTION
        ? form.org_industry_other.trim()
        : form.org_industry;

    const existingDocs = form.supplementary_documents.filter((doc) => typeof doc === "string");

    const payload = {
      ...form,
      org_industry: normalizedIndustry,
      org_industry_other:
        form.org_industry === OTHER_OPTION ? form.org_industry_other.trim() : "",
      project_sector: normalizedIndustry,
      scope_clarity: form.scope_clarity,
      publication_potential: form.publication_potential,
      required_skills: normalizedSkills,
      technical_domains: normalizedDomains,
      minimum_deliverables: form.minimum_deliverables,
      stretch_goals: form.stretch_goals,
      long_term_impact: form.long_term_impact,
      supplementary_documents: existingDocs,
      video_links: form.video_links.map((v) => v.trim()).filter(Boolean),
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    form.supplementary_documents.forEach((file) => {
      if (file instanceof File) {
        formData.append("documents", file);
      }
    });

    setSubmitting(true);
    setSubmitError(null);
    setBanner(null);

    const submitPromise = token
      ? updateClientIntake(token, formData)
      : submitClientIntake(formData);

    submitPromise
      .then((res) => {
        const editUrl = res?.edit_url || "";
        const extracted = String(editUrl).match(/\/edit\/([^/?#]+)/)?.[1] || "";
        const finalToken = token || extracted;

        if (finalToken) {
          navigate(`/submitted/${encodeURIComponent(finalToken)}`);
          return;
        }

        setSubmitted(true);
      })
      .catch((err) => {
        if (err?.status === 409) {
          const orgName = (payload.org_name || "").trim();
          setBanner(
            `${orgName || "This org"} already exists, please use edit link to edit your submission, if you have missplaced it, you may contact: ABC`
          );
          return;
        }
        setSubmitError(String(err));
      })
      .finally(() => setSubmitting(false));
  }

  useEffect(() => {
    if (!token) return;
    setLoadingEdit(true);
    setSubmitError(null);
    getClientIntakeForEdit(token)
      .then((res) => {
        const item = res.item || {};
        const industryValue = item.org_industry || item.company_industry || "";
        const isIndustryOther = industryValue && !INDUSTRIES.includes(industryValue);
        const skillList = Array.isArray(item.required_skills) ? item.required_skills : [];
        const knownSkills = skillList.filter((skill) => SKILLS.includes(skill));
        const otherSkills = skillList.filter((skill) => !SKILLS.includes(skill));
        const requiredSkills = otherSkills.length
          ? [...knownSkills, OTHER_OPTION]
          : knownSkills;
        const requiredSkillsOther =
          item.required_skills_other || otherSkills.join(", ");
        setForm((f) => ({
          ...f,
          org_name: item.org_name || item.company_name || "",
          org_industry: isIndustryOther ? OTHER_OPTION : industryValue,
          org_industry_other: isIndustryOther
            ? (item.org_industry_other || item.company_industry_other || industryValue)
            : (item.org_industry_other || item.company_industry_other || ""),
          org_website: item.org_website || item.company_website || "",
          contact_name: item.contact_name || "",
          contact_email: item.contact_email || "",
          project_title: item.project_title || "",
          project_summary: item.project_summary || "",
          project_description: item.project_description || "",
          minimum_deliverables: item.minimum_deliverables || "",
          stretch_goals: item.stretch_goals || "",
          long_term_impact: item.long_term_impact || "",
          scope_clarity: item.scope_clarity || "",
          scope_clarity_other: item.scope_clarity_other || "",
          publication_potential: item.publication_potential || "",
          required_skills: requiredSkills,
          required_skills_other: requiredSkillsOther,
          technical_domains: item.technical_domains?.length
            ? item.technical_domains.join("\n")
            : (item.technical_domains || ""),
          data_access: item.data_access || "",
          supplementary_documents: item.supplementary_documents || [],
          video_links: item.video_links?.length ? item.video_links : [""],
        }));
      })
      .catch((err) => setSubmitError(String(err)))
      .finally(() => setLoadingEdit(false));
  }, [token]);

  const pages = [
    // 0: Corporate Entity Details + Primary Point of Contact
    <>
      <h2 className="section-title">1. Corporate Entity Details & Primary Point of Contact</h2>

      <label className="label">Organization Name*</label>
      <input
        name="org_name"
        value={form.org_name}
        onChange={handleChange}
        maxLength={200}
        className="input-base"
        placeholder='E.g., "Acme Health Systems" or "Duke University — Pratt (ECE)"'
      />
      {errors.org_name && (
        <div className="error-text">{errors.org_name}</div>
      )}

      <label className="label">Organization Industry*</label>
      <p className="muted">If you are at Duke, specify your school and department.</p>
      <select
        name="org_industry"
        value={form.org_industry}
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
      {errors.org_industry && (
        <div className="error-text">{errors.org_industry}</div>
      )}
      {form.org_industry === OTHER_OPTION && (
        <>
          <input
            name="org_industry_other"
            value={form.org_industry_other}
            onChange={handleChange}
            placeholder="E.g., Public Policy — Sanford"
            className="input-base mt-2"
          />
          {errors.org_industry_other && (
            <div className="error-text">{errors.org_industry_other}</div>
          )}
        </>
      )}

      <label className="label">Contact Name*</label>
      <input
        name="contact_name"
        value={form.contact_name}
        onChange={handleChange}
        maxLength={100}
        className="input-base"
        placeholder="E.g., Jane Smith"
      />
      {errors.contact_name && (
        <div className="error-text">{errors.contact_name}</div>
      )}

      <label className="label">Contact Email*</label>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        name="contact_email"
        value={form.contact_email}
        onChange={handleChange}
        className="input-base"
        placeholder="name@org.com"
      />
      {errors.contact_email && (
        <div className="error-text">{errors.contact_email}</div>
      )}
    </>,

    // 1: Project Specification
    <>
      <h2 className="section-title">2. Project Specification</h2>

      <label className="label">Project Title*</label>
      <input
        name="project_title"
        value={form.project_title}
        onChange={handleChange}
        maxLength={150}
        className="input-base"
        placeholder="E.g., Forecast customer churn risk from usage data"
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
        placeholder="1–2 sentences summarizing the problem and expected outcome"
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
        placeholder="Background / who is impacted / current process / what success looks like"
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
        maxLength={5000}
        placeholder="Describe the minimum achievable deliverables within the project timeline."
      />
      {errors.minimum_deliverables && (
        <div className="error-text">{errors.minimum_deliverables}</div>
      )}

      <label className="label">
        Stretch goals that modestly exceed baseline expectations while remaining feasible
      </label>
      <textarea
        name="stretch_goals"
        value={form.stretch_goals}
        onChange={handleChange}
        className="textarea-base"
        maxLength={5000}
        placeholder="Optional. Describe any stretch goals if applicable."
      />
      {errors.stretch_goals && (
        <div className="error-text">{errors.stretch_goals}</div>
      )}

      <label className="label">
        Significant contributions that extend beyond the project scope to drive long-term innovation and impact
      </label>
      <textarea
        name="long_term_impact"
        value={form.long_term_impact}
        onChange={handleChange}
        className="textarea-base"
        maxLength={5000}
        placeholder="Optional. Describe longer-term impact or follow-on opportunities."
      />
      {errors.long_term_impact && (
        <div className="error-text">{errors.long_term_impact}</div>
      )}

      <label className="label">
        Would you characterise your project as well defined with specific steps, or as exploratory with open ended goals?*
      </label>
      <p className="muted">Choose the option that best matches how clear the scope is today.</p>
      <select
        name="scope_clarity"
        value={form.scope_clarity}
        onChange={handleChange}
        className="select-base"
      >
        <option value="">Select...</option>
        {SCOPE.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      {errors.scope_clarity && (
        <div className="error-text">{errors.scope_clarity}</div>
      )}

      <label className="label">Publication Potential*</label>
      <p className="muted">No expectation or requirement—this is only to understand potential outcomes.</p>
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

    // 2: Required Competencies & Technologies
    <>
      <h2 className="section-title">3. Required Competencies and Technologies</h2>

      <MultiSelect
        options={SKILLS}
        value={form.required_skills}
        onChange={(v) => setForm((f) => ({ ...f, required_skills: v }))}
        label="Required Skills (select all that apply)"
        otherValue={form.required_skills_other}
        onOtherChange={(v) => setForm((f) => ({ ...f, required_skills_other: v }))}
      />
      {errors.required_skills_other && (
        <div className="error-text">{errors.required_skills_other}</div>
      )}

      <label className="label">
        Technical Domains (Optional): Add specific domains if applicable, such as IoT, advisement,
        compliance and gaming.
      </label>
      <p className="muted">Optional. Separate items with commas or new lines.</p>
      <textarea
        name="technical_domains"
        value={form.technical_domains}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Enter domains, separated by commas or new lines"
      />

      <label className="label">
        Data Access (If you plan to provide proprietary data, please briefly describe it. If not,
        list recommended public datasets if any, or indicate that students will need to find all
        relevant public data on their own.)*
      </label>
      <p className="muted">Include data type, size, access method, and any restrictions.</p>
      <textarea
        name="data_access"
        value={form.data_access}
        onChange={handleChange}
        className="textarea-base"
        placeholder="Describe data access and sources"
      />
      {errors.data_access && (
        <div className="error-text">{errors.data_access}</div>
      )}

      {errors.required_skills && (
        <div className="error-text">{errors.required_skills}</div>
      )}
    </>,

    // 3: Supplementary Materials
    <>
      <h2 className="section-title">4. Supplementary Materials</h2>

      <label className="label">Organization Website (Optional)</label>
      <p className="muted">If applicable, paste the full URL including https://</p>
      <input
        type="url"
        inputMode="url"
        name="org_website"
        value={form.org_website}
        onChange={handleChange}
        className="input-base"
        placeholder="https://www.example.org"
      />
      {errors.org_website && (
        <div className="error-text">{errors.org_website}</div>
      )}

      <label className="label">Supplementary Documents</label>
      <p className="muted">
        Optional. Upload supporting docs (PDF/spec deck/sample data/background brief). Choose one file,
        then click “Add file”.
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
            <li
              key={`${typeof file === "string" ? file : file.name}-${idx}`}
              className="flex items-center gap-2"
            >
              {typeof file === "string" ? (
                <a
                  href={file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-duke-700 underline"
                >
                  {file}
                </a>
              ) : (
                <span className="text-sm text-slate-700">{file.name}</span>
              )}
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
        Optional. Paste up to 10 links (e.g., YouTube/Vimeo/Drive) to provide helpful context.
      </p>
      {form.video_links.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            value={v}
            onChange={(e) =>
              handleListChange("video_links", i, e.target.value)
            }
            type="url"
            inputMode="url"
            placeholder="https://..."
            className="input-base"
          />
          {form.video_links.length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem("video_links", i, 1)}
              className="btn-secondary px-3 py-2"
              aria-label="Remove video link"
            >
              -
            </button>
          )}
          {i === form.video_links.length - 1 && (
            <button
              type="button"
              onClick={() => addListItem("video_links", 10)}
              className="btn-secondary px-3 py-2"
              aria-label="Add video link"
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
      {banner ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Dismiss banner"
            className="absolute inset-0 bg-slate-900/20"
            onClick={() => setBanner(null)}
          />
          <div className="relative card w-[min(40rem,calc(100%-2rem))] p-6 text-center">
            <div className="font-heading text-duke-900 text-xl">Organization already submitted</div>
            <div className="mt-2 text-sm text-slate-700">{banner}</div>
            <div className="mt-5 flex justify-center">
              <button type="button" className="btn-primary" onClick={() => setBanner(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
              Organization Project Intake Form
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
