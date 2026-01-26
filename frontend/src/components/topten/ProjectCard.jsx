import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function ProjectCard({ project, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { origin: "grid" },
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 transition-transform duration-150 ${
        isDragging ? "scale-[1.02] shadow-lg" : "hover:-translate-y-0.5"
      } ${disabled ? "opacity-50" : "cursor-grab"}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-duke-900">{project.title}</h3>
        <span className="text-xs text-slate-500">{project.difficulty}</span>
      </div>
      <div className="text-sm text-slate-600 mt-1">{project.company}</div>
      <div className="flex flex-wrap gap-2 mt-3">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
