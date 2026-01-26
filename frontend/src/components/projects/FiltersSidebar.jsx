import React from "react";
import FilterSection from "./FilterSection.jsx";

const domainPills = ["AI/ML", "Analytics", "Data Engineering", "Product", "Web Dev"];
const modalityOptions = ["Remote", "Hybrid", "In-person"];

export default function FiltersSidebar() {
  return (
    <aside className="w-full md:w-[300px] space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-heading text-duke-900">Filters</h2>
        <p className="muted mt-1">Refine results by skill and logistics.</p>
      </div>

      <FilterSection title="Domain & Skills">
        <div>
          <div className="label">Technical Domain</div>
          <div className="flex flex-wrap gap-2">
            {domainPills.map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 rounded-full border border-duke-700 text-duke-700 text-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="label">Required Skills</div>
          <input className="input-base" placeholder="Search skills" />
          <div className="flex flex-wrap gap-2 mt-2">
            {["Python", "TensorFlow"].map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Project Characteristics">
        <div>
          <div className="label">Difficulty Level</div>
          <div className="space-y-2">
            {["Introductory", "Intermediate", "Advanced"].map((level) => (
              <label key={level} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="accent-duke-900" />
                {level}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="label">Weekly Time Commitment</div>
          <input type="range" min="5" max="30" className="w-full" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5h</span>
            <span>30h</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Logistics">
        <div>
          <div className="label">Modality</div>
          <div className="flex flex-wrap gap-2">
            {modalityOptions.map((modality) => (
              <span key={modality} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                {modality}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="label">Cadence</div>
          <select className="select-base">
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Monthly</option>
          </select>
        </div>
        <div>
          <div className="label">Confidentiality</div>
          <select className="select-base">
            <option>None</option>
            <option>NDA Required</option>
            <option>IP Agreement</option>
          </select>
        </div>
      </FilterSection>

      <FilterSection title="Company">
        <div>
          <div className="label">Industry</div>
          <select className="select-base">
            <option>Healthcare</option>
            <option>Finance</option>
            <option>Climate</option>
            <option>Education</option>
            <option>Public Sector</option>
          </select>
        </div>
        <div>
          <div className="label">Company Size</div>
          <select className="select-base">
            <option>1-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000+</option>
          </select>
        </div>
      </FilterSection>
    </aside>
  );
}
