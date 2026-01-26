import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import SearchHeader from "../components/projects/SearchHeader.jsx";
import FiltersSidebar from "../components/projects/FiltersSidebar.jsx";
import ProjectsGrid from "../components/projects/ProjectsGrid.jsx";
import { projectsCatalog } from "../data/projectsCatalog.js";
import { useTopTenStore } from "../components/topten/useTopTenStore.js";

export default function Projects() {
  const { topTen, addToTopTen } = useTopTenStore();
  const topTenSet = useMemo(() => new Set(topTen), [topTen]);

  function handleAdd(projectId) {
    addToTopTen(projectId);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="card p-6">
          <SearchHeader />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <FiltersSidebar />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Active Projects", value: "24" },
                { label: "New This Week", value: "5" },
                { label: "Avg Match Score", value: "86%" },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <div className="text-sm text-slate-500">{stat.label}</div>
                  <div className="text-2xl font-semibold text-duke-900 mt-1">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-slate-500">
                Showing {projectsCatalog.length} curated projects
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by</span>
                <select className="select-base w-52">
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Closest Deadline</option>
                </select>
              </div>
            </div>

            <ProjectsGrid
              projects={projectsCatalog}
              onAdd={handleAdd}
              topTenSet={topTenSet}
            />

            <div className="card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-heading text-duke-900">Need a custom match?</h3>
                <p className="muted mt-1">
                  Tell us your focus area and we will curate a tailored shortlist.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary">Share Preferences</button>
                <button className="btn-primary">Request Brief</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Projects in cart</div>
            <div className="text-xl font-semibold text-duke-900">
              {topTen.length} / 10 selected
            </div>
          </div>
          <Link to="/ranking" className="btn-primary">
            Go to Ranking
          </Link>
        </div>
      </div>
    </div>
  );
}
