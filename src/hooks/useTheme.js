import { useState, useEffect, useCallback } from 'react';
import { THEMES } from '../utils/constants';

export const useTheme = (initialTheme = 'midnight') => {
  const [activeTheme, setActiveTheme] = useState(() => {
    const savedTheme = localStorage.getItem('chat-theme');
    return savedTheme && THEMES[savedTheme] ? savedTheme : initialTheme;
  });

  const [themes] = useState(THEMES);

  const setTheme = useCallback((themeName) => {
    if (THEMES[themeName]) {
      setActiveTheme(themeName);
      localStorage.setItem('chat-theme', themeName);
    }
  }, []);

  const nextTheme = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(activeTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }, [activeTheme, setTheme]);

  const prevTheme = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(activeTheme);
    const prevIndex = (currentIndex - 1 + themeKeys.length) % themeKeys.length;
    setTheme(themeKeys[prevIndex]);
  }, [activeTheme, setTheme]);

  const getThemeClass = useCallback(() => {
    return THEMES[activeTheme] || THEMES.midnight;
  }, [activeTheme]);

  useEffect(() => {
    // Apply theme to document for global styling if needed
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  return {
    activeTheme,
    themes,
    setTheme,
    nextTheme,
    prevTheme,
    getThemeClass,
    themeClass: getThemeClass()
  };
};