import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          // Apply theme to document
          document.documentElement.classList.remove('dark', 'light');
          document.documentElement.classList.add(newTheme);
          return { theme: newTheme };
        });
      },
      
      setTheme: (theme: Theme) => {
        // Apply theme to document
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state) {
          document.documentElement.classList.add(state.theme);
        }
      },
    }
  )
);
