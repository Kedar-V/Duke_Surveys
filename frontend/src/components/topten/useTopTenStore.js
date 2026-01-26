import { create } from "zustand";

export const useTopTenStore = create((set, get) => ({
  topTen: [],
  addToTopTen: (projectId) => {
    const { topTen } = get();
    if (topTen.includes(projectId)) {
      return false;
    }
    set({ topTen: [...topTen, projectId] });
    return true;
  },
  removeFromTopTen: (projectId) => {
    const { topTen } = get();
    set({ topTen: topTen.filter((id) => id !== projectId) });
  },
  reorderTopTen: (next) => {
    set({ topTen: next });
  },
  clearTopTen: () => set({ topTen: [] }),
}));
