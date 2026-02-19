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
    <div className="min-h-screen bg-slate-50 px-4 py-10 relative">
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6">
        <img
          src="/assets/dukelogo.png"
          alt="Duke University"
          className="h-[clamp(2.5rem,12vw,6rem)] sm:h-[clamp(3.25rem,8vw,8rem)] md:h-[clamp(3.75rem,6vw,7.5rem)] w-auto max-w-[55vw] sm:max-w-[45vw] md:max-w-[35vw] object-contain"
        />
      </div>

      <div className="card max-w-3xl mx-auto p-8 mt-10 sm:mt-2">
        <h1 className="text-2xl font-heading text-duke-900">Submission received</h1>

        <div className="mt-4 border border-slate-200 bg-white rounded-lg p-4">
          {editUrl ? (
            <>
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
            Please save this link for editing in future. If you lose it you may contact: ABC
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
