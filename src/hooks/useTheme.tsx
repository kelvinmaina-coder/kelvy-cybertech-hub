import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type ThemeName =
  | "dark"
  | "light"
  | "cyberpunk"
  | "sunset"
  | "forest"
  | "ocean"
  | "royal"
  | "matrix"
  | "midnight"
  | "aurora";

export interface Theme {
  id: ThemeName;
  label: string;
  accent: string;
}

export const themes: Theme[] = [
  { id: "dark", label: "Dark", accent: "#3b82f6" },
  { id: "light", label: "Light", accent: "#0ea5e9" },
  { id: "cyberpunk", label: "Cyberpunk", accent: "#ff00ff" },
  { id: "sunset", label: "Sunset", accent: "#f97316" },
  { id: "forest", label: "Forest", accent: "#22c55e" },
  { id: "ocean", label: "Ocean", accent: "#0ea5e9" },
  { id: "royal", label: "Royal", accent: "#a855f7" },
  { id: "matrix", label: "Matrix", accent: "#00ff41" },
  { id: "midnight", label: "Midnight", accent: "#7c3aed" },
  { id: "aurora", label: "Aurora", accent: "#38bdf8" },
];

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  scanlineEnabled: boolean;
  toggleScanline: () => void;
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  scanlineEnabled: false,
  toggleScanline: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "kelvy-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem(storageKey) as ThemeName) || defaultTheme
  );
  const [scanlineEnabled, setScanlineEnabled] = useState<boolean>(() => {
    return localStorage.getItem("kelvy-scanline") !== "false";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const allThemeClasses: ThemeName[] = [
      "dark",
      "light",
      "cyberpunk",
      "sunset",
      "forest",
      "ocean",
      "royal",
      "matrix",
      "midnight",
      "aurora",
    ];
    root.classList.remove(...allThemeClasses);
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleScanline = () => {
    const newValue = !scanlineEnabled;
    setScanlineEnabled(newValue);
    localStorage.setItem("kelvy-scanline", String(newValue));
  };

  const value = {
    theme,
    setTheme,
    scanlineEnabled,
    toggleScanline,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
