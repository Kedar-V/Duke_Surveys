import React from "react";
import ProjectCard from "./ProjectCard.jsx";

export default function ProjectsGrid({ projects, onAdd, topTenSet }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onAdd={onAdd}
          isSelected={topTenSet?.has(project.id)}
        />
      ))}
    </div>
  );
}
