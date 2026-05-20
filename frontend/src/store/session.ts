import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/lib/api";

interface SessionState {
  user: UserResponse | null;
  token: string | null;
  setUser: (u: UserResponse | null) => void;
  setToken: (t: string | null) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    { name: "aurastream.session" }
  )
);
