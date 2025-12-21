import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { colors, ThemeColors, ThemeMode } from './colors';

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light'
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'light' || colorScheme === 'dark') {
        setMode(colorScheme);
      }
    });

    // Set initial mode based on system preference if no default is provided
    if (defaultMode === 'light') {
      const systemMode = Appearance.getColorScheme();
      if (systemMode === 'light' || systemMode === 'dark') {
        setMode(systemMode);
      }
    }

    return () => subscription?.remove();
  }, [defaultMode]);

  const theme = colors[mode];

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
