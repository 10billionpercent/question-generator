import { create } from "zustand";
import { User } from "@/services/authService";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => set({ user, isLoading: false, error: null }),

  clearUser: () => set({ user: null, isLoading: false, error: null }),

  fetchUser: async () => {
    const { getToken, getMe } = await import("@/services/authService");
    const token = getToken();
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await getMe(token);
      set({ user: data.user, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      set({ user: null, error: "Failed to load user", isLoading: false });
    }
  },
}));
