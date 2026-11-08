import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Default to 'light' (white theme) as requested
  const savedTheme = (localStorage.getItem('drivio_theme') as Theme) || 'light';

  // Apply to document on startup
  if (typeof document !== 'undefined') {
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }

  return {
    theme: savedTheme,
    setTheme: (theme) => {
      localStorage.setItem('drivio_theme', theme);
      if (typeof document !== 'undefined') {
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }
      }
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('drivio_theme', nextTheme);
        if (typeof document !== 'undefined') {
          if (nextTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
          }
        }
        return { theme: nextTheme };
      });
    },
  };
});
