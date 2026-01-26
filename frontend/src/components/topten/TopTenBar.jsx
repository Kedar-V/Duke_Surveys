import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import RankedCard from "./RankedCard.jsx";

const MAX_TOP_TEN = 10;

export default function TopTenBar({ topTen, totalCount, projectsById, onRemove, shake }) {
  const { setNodeRef, isOver } = useDroppable({ id: "topten" });

  const emptySlots = Math.max(0, MAX_TOP_TEN - topTen.length);

  return (
    <section
      ref={setNodeRef}
      className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-slate-200 ${
        shake ? "animate-shake" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-duke-900">Your Top 10 Choices (Ranked)</h3>
          <div className={`text-sm ${isOver ? "text-duke-700" : "text-slate-500"}`}>
            {totalCount ?? topTen.length}/10 ranked
          </div>
        </div>
        <SortableContext items={topTen} strategy={horizontalListSortingStrategy}>
          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-2">
            {topTen.map((projectId, index) => {
              const project = projectsById[projectId];
              if (!project) return null;
              return (
                <RankedCard
                  key={projectId}
                  project={project}
                  rank={index + 1}
                  onRemove={() => onRemove(projectId)}
                />
              );
            })}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <div
                key={`slot-${index}`}
                className="w-[220px] h-[96px] shrink-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400"
              >
                Empty Slot
              </div>
            ))}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
