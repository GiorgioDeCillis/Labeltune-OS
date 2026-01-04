'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'osaka-jade' | 'ayaka' | 'purple-moon' | 'custom';

interface ThemeConfig {
  name: ThemeType;
  wallpaper: string;
}

interface ThemeContextType {
  theme: ThemeType;
  wallpaper: string;
  blur: number;
  transparency: number;
  setTheme: (theme: ThemeType) => void;
  setWallpaper: (url: string) => void;
  setBlur: (value: number) => void;
  setTransparency: (value: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('osaka-jade');
  const [wallpaper, setWallpaperState] = useState<string>('/themes/osaka-jade/2-osaka-jade-bg.jpg');
  const [blur, setBlurState] = useState<number>(2);
  const [transparency, setTransparencyState] = useState<number>(0.75);

  useEffect(() => {
    // Load from localStorage if available
    const savedTheme = localStorage.getItem('labeltune-theme') as ThemeType;
    const savedWallpaper = localStorage.getItem('labeltune-wallpaper');
    const savedBlur = localStorage.getItem('labeltune-blur');
    const savedTransparency = localStorage.getItem('labeltune-transparency');

    if (savedTheme) setThemeState(savedTheme);
    if (savedWallpaper) setWallpaperState(savedWallpaper);
    if (savedBlur) setBlurState(parseFloat(savedBlur));
    if (savedTransparency) setTransparencyState(parseFloat(savedTransparency));
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('labeltune-theme', newTheme);

    // Set default wallpaper if switching theme
    if (newTheme === 'osaka-jade') {
      setWallpaper('/themes/osaka-jade/2-osaka-jade-bg.jpg');
    } else if (newTheme === 'ayaka') {
      setWallpaper('/themes/ayaka/b2.jpg');
    } else if (newTheme === 'purple-moon') {
      setWallpaper('/themes/purple-moon/BG09.jpg');
    }
  };

  const setWallpaper = (url: string) => {
    setWallpaperState(url);
    localStorage.setItem('labeltune-wallpaper', url);
  };

  const setBlur = (value: number) => {
    setBlurState(value);
    localStorage.setItem('labeltune-blur', value.toString());
  };

  const setTransparency = (value: number) => {
    setTransparencyState(value);
    localStorage.setItem('labeltune-transparency', value.toString());
  };

  return (
    <ThemeContext.Provider value={{ theme, wallpaper, blur, transparency, setTheme, setWallpaper, setBlur, setTransparency }}>
      <div
        data-theme={theme}
        className="min-h-screen transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          '--bg-blur': `${blur}px`,
          '--glass-opacity': transparency,
          '--glass-blur': `${Math.min(blur * 5, 20)}px`
        } as React.CSSProperties}
      >
        <div
          className="min-h-screen backdrop-blur-[var(--bg-blur)] bg-black/20"
        >
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
