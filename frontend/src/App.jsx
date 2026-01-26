import React, { useMemo, useState } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import TopTenBar from "./components/topten/TopTenBar.jsx";
import OverflowList from "./components/topten/OverflowList.jsx";
import { useDndSensors } from "./components/topten/dndSensors.js";
import { useTopTenStore } from "./components/topten/useTopTenStore.js";
import { projectsCatalog } from "./data/projectsCatalog.js";

export default function App() {
  const sensors = useDndSensors();
  const { topTen, removeFromTopTen, reorderTopTen } = useTopTenStore();
  const [activeId, setActiveId] = useState(null);

  const projectsById = useMemo(() => {
    return projectsCatalog.reduce((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, []);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdValue = active.id;
    const overId = over.id;

    if (activeIdValue === overId) return;

    const rankedIds = topTen.slice(0, 10);
    const overflowIds = topTen.slice(10);

    const sourceContainer = active.data.current?.container;
    let destContainer = over.data.current?.container;

    if (!destContainer) {
      if (overId === "topten") destContainer = "topten";
      if (overId === "overflow") destContainer = "overflow";
    }

    const isRankedTarget = destContainer === "topten";
    const isOverflowTarget = destContainer === "overflow";

    const nextRanked = [...rankedIds];
    const nextOverflow = [...overflowIds];

    const removeFromList = (list) => {
      const index = list.indexOf(activeIdValue);
      if (index !== -1) list.splice(index, 1);
      return index;
    };

    if (sourceContainer === "topten") {
      removeFromList(nextRanked);
    } else if (sourceContainer === "overflow") {
      removeFromList(nextOverflow);
    }

    const insertIntoList = (list) => {
      const index = list.indexOf(overId);
      if (index === -1) {
        list.push(activeIdValue);
      } else {
        list.splice(index, 0, activeIdValue);
      }
    };

    if (isRankedTarget) {
      insertIntoList(nextRanked);
    } else if (isOverflowTarget) {
      insertIntoList(nextOverflow);
    } else {
      return;
    }

    if (nextRanked.length > 10) {
      const spill = nextRanked.pop();
      if (spill) nextOverflow.unshift(spill);
    }

    reorderTopTen([...nextRanked, ...nextOverflow]);
  }

  const activeProject = activeId ? projectsById[activeId] : null;
  const rankedIds = topTen.slice(0, 10);
  const overflowIds = topTen.slice(10);

  return (
    <div className="min-h-screen bg-slate-50 pb-48">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-heading text-duke-900">Capstone Project Ranking</h1>
          <p className="muted mt-2">
            Reorder your selected projects to finalize your ranking.
          </p>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <OverflowList
            overflowIds={overflowIds}
            projectsById={projectsById}
            onRemove={removeFromTopTen}
          />
          <TopTenBar
            topTen={rankedIds}
            totalCount={topTen.length}
            projectsById={projectsById}
            onRemove={removeFromTopTen}
          />
          <DragOverlay>
            {activeProject ? (
              <div className="card p-4 shadow-lg scale-[1.02]">
                <div className="text-sm font-semibold text-duke-900">{activeProject.title}</div>
                <div className="text-xs text-slate-500 mt-1">{activeProject.company}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {topTen.length === 0 ? (
          <div className="card p-6 text-center">
            <div className="text-duke-900 font-semibold">No projects selected yet</div>
            <div className="muted mt-2">Go back to the catalog to add projects.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
