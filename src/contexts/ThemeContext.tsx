import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'navy' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mentor-buddy-theme') as Theme;
      return stored || 'dark';
    }
    return 'dark';
  });

  const themes = [
    { 
      value: 'dark' as Theme, 
      label: 'Dark Mode', 
      description: 'High contrast dark theme with optimal readability' 
    },
    { 
      value: 'navy' as Theme, 
      label: 'Navy Blue', 
      description: 'Professional navy theme with vibrant blue accents' 
    },
    { 
      value: 'light' as Theme, 
      label: 'Light Mode', 
      description: 'Elegant white shade palette with warm undertones' 
    },
  ];

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-dark', 'theme-navy', 'theme-light');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Store theme preference
    localStorage.setItem('mentor-buddy-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}