import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "dark" | "cyberpunk" | "sunset" | "forest" | "ocean" | "royal" | "matrix";

export interface Theme {
  id: ThemeName;
  label: string;
  accent: string;
}

export const themes: Theme[] = [
  { id: "dark", label: "Default Dark", accent: "#3b82f6" },
  { id: "cyberpunk", label: "Cyberpunk", accent: "#ff00ff" },
  { id: "sunset", label: "Sunset Glow", accent: "#f97316" },
  { id: "forest", label: "Deep Forest", accent: "#22c55e" },
  { id: "ocean", label: "Ocean Deep", accent: "#0ea5e9" },
  { id: "royal", label: "Royal Purple", accent: "#a855f7" },
  { id: "matrix", label: "Matrix Code", accent: "#00ff41" },
];

interface ThemeProviderProps {
  children: React.ReactNode;
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
    return localStorage.getItem("kelvy-scanline") !== "false"; // Default to true
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const allThemeClasses: ThemeName[] = ["dark", "cyberpunk", "sunset", "forest", "ocean", "royal", "matrix"];
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
