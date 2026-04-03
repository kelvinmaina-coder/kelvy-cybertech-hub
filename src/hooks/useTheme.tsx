import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "default" | "cyberpunk" | "sunset" | "forest" | "ocean" | "royal" | "matrix";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  scanlineEnabled: boolean;
  toggleScanline: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const themes: { id: ThemeName; label: string; accent: string }[] = [
  { id: "default", label: "Cyber Dark", accent: "hsl(157, 100%, 50%)" },
  { id: "cyberpunk", label: "Cyberpunk", accent: "hsl(330, 100%, 60%)" },
  { id: "sunset", label: "Sunset", accent: "hsl(25, 95%, 55%)" },
  { id: "forest", label: "Forest", accent: "hsl(140, 70%, 45%)" },
  { id: "ocean", label: "Ocean", accent: "hsl(200, 80%, 50%)" },
  { id: "royal", label: "Royal", accent: "hsl(270, 60%, 60%)" },
  { id: "matrix", label: "Matrix", accent: "hsl(120, 100%, 50%)" },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => (localStorage.getItem("kelvy-theme") as ThemeName) || "default");
  const [scanlineEnabled, setScanline] = useState(() => localStorage.getItem("kelvy-scanline") !== "false");

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("kelvy-theme", t);
  };

  const toggleScanline = () => {
    setScanline(prev => {
      localStorage.setItem("kelvy-scanline", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, scanlineEnabled, toggleScanline }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
