import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "@/lib/api";

interface SessionState {
  user: Usuario | null;
  setUser: (u: Usuario | null) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "aurastream.session" }
  )
);
