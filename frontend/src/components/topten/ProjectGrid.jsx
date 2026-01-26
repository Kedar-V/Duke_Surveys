import React from "react";
import { useDroppable } from "@dnd-kit/core";
import ProjectCard from "./ProjectCard.jsx";

export default function ProjectGrid({ projects, topTen }) {
  const { setNodeRef, isOver } = useDroppable({ id: "grid" });

  const topTenSet = new Set(topTen);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-heading text-duke-900">Project Catalog</h2>
        <p className="muted mt-1">Drag projects into your top 10 bar.</p>
      </div>
      <div
        ref={setNodeRef}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl p-2 transition-colors duration-150 ${
          isOver ? "bg-duke-50" : "bg-transparent"
        }`}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            disabled={topTenSet.has(project.id)}
          />
        ))}
      </div>
    </section>
  );
}
