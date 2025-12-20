import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../shared/types/user.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setLogin: (accessToken: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      
      setLogin: (accessToken: string, refreshToken: string, user: User) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },
      
      setUser: (user: User) => {
        set({ user });
      },
      
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
