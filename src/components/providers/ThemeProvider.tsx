"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

/** Supported theme modes */
type Theme = "dark" | "light";

/** Shape of the theme context value */
interface ThemeContextType {
  /** Current active theme */
  theme: Theme;
  /** Toggles between dark and light theme */
  toggleTheme: () => void;
}

/** LocalStorage key for persisting theme preference */
const THEME_STORAGE_KEY = "vb_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

/**
 * Theme provider component that manages dark/light mode state.
 * Persists the user's preference to localStorage and applies
 * the appropriate CSS class to the document root element.
 *
 * @param {{ children: ReactNode }} props - Child components.
 * @returns {React.ReactElement} The provider wrapping children.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch {
      // localStorage may be unavailable in some contexts
    }
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage may be unavailable
    }
  }, [theme, mounted]);

  /**
   * Toggles the theme between dark and light mode.
   */
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and toggle function.
 *
 * @returns {ThemeContextType} The theme context value.
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme();
 * ```
 */
export const useTheme = () => useContext(ThemeContext);
