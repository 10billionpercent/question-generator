import { create } from "zustand";
import { getToken, getMe } from "@/services/authService";

interface AssignmentStore {
  count: number;
  isLoading: boolean;
  fetchCount: () => Promise<void>;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  count: 0,
  isLoading: false,
  fetchCount: async () => {
    const token = getToken();
    if (!token) {
      set({ count: 0, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await getMe(token);
      const assignmentsCount = data.assignments?.length || 0;
      set({ count: assignmentsCount, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch assignments count", err);
      set({ count: 0, isLoading: false });
    }
  },
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
  setCount: (count) => set({ count }),
}));
