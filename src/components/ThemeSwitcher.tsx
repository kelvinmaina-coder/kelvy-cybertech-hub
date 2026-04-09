import { Palette } from "lucide-react";
import { useTheme, themes, ThemeName } from "@/hooks/useTheme";
import { useState } from "react";

export default function ThemeSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme, scanlineEnabled, toggleScanline } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition w-full"
        title="Switch Theme"
      >
        <Palette className="w-3.5 h-3.5 shrink-0" />
        {!collapsed && <span className="font-mono truncate">{themes.find(t => t.id === theme)?.label || "Select Theme"}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[180px] p-2 animate-fade-in">
            <p className="text-[10px] text-muted-foreground font-mono px-2 mb-1">THEMES</p>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-mono transition ${
                  theme === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-border shrink-0" style={{ background: t.accent }} />
                {t.label}
              </button>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={toggleScanline}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
              >
                <span className={`w-3 h-3 rounded border ${scanlineEnabled ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                Scanline Effect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
