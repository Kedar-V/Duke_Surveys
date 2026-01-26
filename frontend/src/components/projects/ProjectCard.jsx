import React, { useState } from "react";

export default function ProjectCard({ project, onAdd, isSelected }) {
  const [rating, setRating] = useState(0);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="pill">{project.domain}</span>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`text-lg transition ${
                  rating >= value ? "text-yellow-400" : "text-slate-300"
                } hover:scale-110`}
                aria-label={`Rate ${value} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-duke-900 mt-3">{project.title}</h3>
          <p className="muted mt-2">{project.summary}</p>
        </div>
        <div className="text-xs text-slate-500">{project.duration}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {project.meta.map((item) => (
          <span key={item} className="text-xs text-slate-600">
            {item}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Sponsored by {project.sponsor}</div>
        <button
          type="button"
          onClick={() => onAdd?.(project.id)}
          className={`btn-primary ${isSelected ? "opacity-70 pointer-events-none" : ""}`}
        >
          {isSelected ? "Added" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
