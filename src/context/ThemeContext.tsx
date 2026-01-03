'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'osaka-jade' | 'ayaka' | 'custom';

interface ThemeConfig {
  name: ThemeType;
  wallpaper: string;
}

interface ThemeContextType {
  theme: ThemeType;
  wallpaper: string;
  setTheme: (theme: ThemeType) => void;
  setWallpaper: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('osaka-jade');
  const [wallpaper, setWallpaperState] = useState<string>('/themes/osaka-jade/2-osaka-jade-bg.jpg');

  useEffect(() => {
    // Load from localStorage if available
    const savedTheme = localStorage.getItem('labeltune-theme') as ThemeType;
    const savedWallpaper = localStorage.getItem('labeltune-wallpaper');
    
    if (savedTheme) setThemeState(savedTheme);
    if (savedWallpaper) setWallpaperState(savedWallpaper);
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('labeltune-theme', newTheme);
    
    // Set default wallpaper if switching theme
    if (newTheme === 'osaka-jade') {
      setWallpaper('/themes/osaka-jade/2-osaka-jade-bg.jpg');
    } else if (newTheme === 'ayaka') {
      setWallpaper('/themes/ayaka/b2.jpg');
    }
  };

  const setWallpaper = (url: string) => {
    setWallpaperState(url);
    localStorage.setItem('labeltune-wallpaper', url);
  };

  return (
    <ThemeContext.Provider value={{ theme, wallpaper, setTheme, setWallpaper }}>
      <div 
        data-theme={theme}
        className="min-h-screen transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen backdrop-blur-[2px] bg-black/20">
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
