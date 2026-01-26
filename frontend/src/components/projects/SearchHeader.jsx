import React from "react";

export default function SearchHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-heading text-duke-900">Capstone Projects</h1>
        <p className="muted mt-1">Explore capstone opportunities tailored to your skills.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-full md:w-[420px]">
          <input
            className="input-base pl-10"
            placeholder="Try: ‘ML projects with NLP focus’ or ‘Sustainability analytics’..."
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            🔎
          </span>
        </div>
        <div className="h-10 w-10 rounded-full bg-duke-900 text-white flex items-center justify-center font-semibold">
          AV
        </div>
      </div>
    </div>
  );
}
