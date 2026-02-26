import React from "react";
import { Link } from "react-router-dom";

export default function ClientInfoWelcome() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <img
          src="/assets/dukelogo.svg"
          alt="Duke University"
          className="h-[clamp(2.25rem,10vw,4.5rem)] w-auto max-w-[55vw] sm:max-w-[40vw] object-contain"
        />
      </div>

      <div className="card max-w-3xl mx-auto p-8 mt-6">
        <h1 className="text-2xl font-heading text-duke-900">Welcome</h1>
        <p className="mt-2 text-slate-700">
          This form collects the details we need to scope your capstone project. Having the
          information below ready will make the submission faster.
        </p>

        <div className="mt-6">
          <div className="text-duke-900 font-semibold">What to expect</div>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>Multi-step form; you can go back to edit answers before submitting.</li>
            <li>After submitting, you’ll receive an edit link—save it for future updates.</li>
            <li>You can upload supplementary documents and add video links (optional).</li>
          </ul>
        </div>

        <div className="mt-6">
          <div className="text-duke-900 font-semibold">Have this ready</div>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>Organization name, website, and contact name/email.</li>
            <li>Project title, summary, and detailed description.</li>
            <li>Minimum deliverables, stretch goals, and expected impact.</li>
            <li>Required skills and technical domains.</li>
            <li>Any supplementary documents or relevant links (optional).</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link className="btn-primary" to="/form">
            Start the form
          </Link>
        </div>

        <div className="mt-4 text-sm text-slate-700">
          If you received an edit link, open it directly (it looks like <span className="font-mono">/edit/&lt;token&gt;</span>).
        </div>
      </div>
    </div>
  );
}
