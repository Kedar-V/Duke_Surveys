import React from "react";

export default function FilterSection({ title, children }) {
  return (
    <div className="border border-slate-200 rounded-card bg-white">
      <button className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="font-semibold text-slate-700">{title}</span>
        <span className="text-slate-500">▾</span>
      </button>
      <div className="px-4 pb-4 space-y-3">{children}</div>
    </div>
  );
}
