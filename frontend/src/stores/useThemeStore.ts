import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
persist(
  (set) => ({
    // Check if the user's OS is already in dark mode
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches, 
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  }),
  { name: 'editorial-theme-storage' }
)
);