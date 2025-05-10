import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  token_balance: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  isAdmin: boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isInitialized: false,
      login: (user: User, token: string) => {
        localStorage.setItem("token", token);
        set({ user, token, isInitialized: true });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isInitialized: true });
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
      isAdmin: false,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
          state.isLoading = false;
        }
      },
    }
  )
);
