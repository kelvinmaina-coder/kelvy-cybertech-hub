import React, { useState } from 'react';
import { Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, scanlineEnabled, toggleScanline } = useTheme();

  const options = [
    { name: 'Dark', value: 'dark', icon: <Moon className="w-4 h-4" /> },
    { name: 'Cyberpunk', value: 'cyberpunk', icon: <Palette className="w-4 h-4" /> },
    { name: 'Sunset', value: 'sunset', icon: <Palette className="w-4 h-4" /> },
    { name: 'Forest', value: 'forest', icon: <Palette className="w-4 h-4" /> },
    { name: 'Ocean', value: 'ocean', icon: <Palette className="w-4 h-4" /> },
    { name: 'Royal', value: 'royal', icon: <Palette className="w-4 h-4" /> },
    { name: 'Matrix', value: 'matrix', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-800 rounded-md transition-colors">
        <Palette className="w-5 h-5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setTheme(option.value as any); setIsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${theme === option.value ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
              <button onClick={toggleScanline} className="mt-2 w-full px-3 py-2 rounded-lg text-sm bg-muted/70 hover:bg-muted">
                {scanlineEnabled ? 'Disable Scanline' : 'Enable Scanline'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
