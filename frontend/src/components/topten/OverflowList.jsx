import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import OverflowCard from "./OverflowCard.jsx";

export default function OverflowList({ overflowIds, projectsById, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: "overflow" });

  if (overflowIds.length === 0) return null;

  return (
    <div ref={setNodeRef} className={`card p-6 ${isOver ? "bg-duke-50" : ""}`}>
      <div className="text-duke-900 font-semibold">Additional selections (not ranked yet)</div>
      <div className="muted mt-1">Drag into the top bar to include in your top 10.</div>
      <SortableContext items={overflowIds} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {overflowIds.map((projectId) => {
            const project = projectsById[projectId];
            if (!project) return null;
            return (
              <OverflowCard
                key={projectId}
                project={project}
                onRemove={() => onRemove(projectId)}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}
