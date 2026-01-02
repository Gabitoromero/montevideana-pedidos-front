import { create } from 'zustand';
import type { User } from '../shared/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setLogin: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// ✅ No more localStorage persistence - cookies handle auth
// ✅ No more tokens in state - they're in HTTP-only cookies
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  
  setLogin: (user: User) => {
    set({
      user,
      isAuthenticated: true,
    });
  },
  
  setUser: (user: User) => {
    set({ 
      user,
      isAuthenticated: true,
    });
  },
  
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
