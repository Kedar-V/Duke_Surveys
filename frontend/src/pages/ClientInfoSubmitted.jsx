import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ClientInfoSubmitted() {
  const { token } = useParams();
  const [copyStatus, setCopyStatus] = useState("");

  const editUrl = token
    ? `${window.location.origin}/edit/${encodeURIComponent(token)}`
    : "";

  async function handleCopy() {
    if (!editUrl) return;
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
  }

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
        <h1 className="text-2xl font-heading text-duke-900">Thank you</h1>
        <p className="mt-2 text-slate-700">
          Your submission has been received.
        </p>

        <div className="mt-4 border border-slate-200 bg-white rounded-lg p-4">
          {editUrl ? (
            <>
              <div className="text-sm font-semibold text-duke-900">Your edit link</div>
              <div className="text-sm text-slate-700 break-all">{editUrl}</div>
              <div className="flex items-center gap-2 mt-3">
                <button type="button" className="btn-secondary" onClick={handleCopy}>
                  Copy link
                </button>
                {copyStatus ? (
                  <span className="text-sm text-slate-600">{copyStatus}</span>
                ) : null}
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-700">
              Missing edit token.
            </div>
          )}

          <div className="mt-3 text-sm text-slate-700">
            Please save this link for future edits. If you lose it you may contact: ABC
          </div>
        </div>

        <div className="mt-6">
          <Link className="btn-secondary" to="/">
            Start a new submission
          </Link>
        </div>
      </div>
    </div>
  );
}
