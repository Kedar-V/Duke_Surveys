import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function RankedCard({ project, rank, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { container: "topten" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[220px] shrink-0 rounded-xl bg-white border border-slate-200 p-3 transition-transform duration-150 ${
        isDragging ? "scale-[1.03] shadow-lg" : "hover:-translate-y-0.5"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold text-duke-700">#{rank}</div>
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500"
          aria-label="Remove from top ten"
        >
          ✕
        </button>
      </div>
      <div className="text-sm font-semibold text-duke-900 mt-2">{project.title}</div>
      <div className="text-xs text-slate-500 mt-1">{project.company}</div>
      <div className="flex flex-wrap gap-1 mt-3">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
