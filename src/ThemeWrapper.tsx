import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';

const cacheRtl = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
const cacheLtr = createCache({ key: 'muiltr' });

const sharedShape = { borderRadius: 16 };
const sharedTypography = {
  fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: 'none' as const, fontWeight: 600, fontSize: '1.05rem' },
};

const islamicThemeOptions = {
  palette: {
    mode: 'light' as const,
    primary: { main: '#1a5c38', contrastText: '#ffffff' },
    secondary: { main: '#c9a84c', contrastText: '#ffffff' },
    background: { default: '#f0f4f0', paper: '#ffffff' },
    text: { primary: '#1a2e1a', secondary: '#4a6a4a' },
  },
  shape: sharedShape,
  typography: sharedTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          minHeight: '48px',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(26, 92, 56, 0.25)',
          },
          '&:active': { transform: 'translateY(1px)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(26, 92, 56, 0.08)',
          border: '1px solid rgba(26, 92, 56, 0.1)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f0f4f0',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: '#f0f4f0' },
          '&::-webkit-scrollbar-thumb': { background: '#a8c4a8', borderRadius: '4px' },
        },
      },
    },
  },
};

const nightThemeOptions = {
  palette: {
    mode: 'dark' as const,
    primary: { main: '#06b6d4', contrastText: '#ffffff' },
    secondary: { main: '#10b981', contrastText: '#ffffff' },
    background: { default: '#0b0f19', paper: '#151c2c' },
    text: { primary: '#f3f4f6', secondary: '#9ca3af' },
  },
  shape: sharedShape,
  typography: sharedTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          minHeight: '48px',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
          },
          '&:active': { transform: 'translateY(1px)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b0f19',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: '#0b0f19' },
          '&::-webkit-scrollbar-thumb': { background: '#1f2937', borderRadius: '4px' },
        },
      },
    },
  },
};

interface ThemeToggleContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggleContext = createContext<ThemeToggleContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeToggleContext);

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('aikf-theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('aikf-theme', next ? 'dark' : 'islamic');
      return next;
    });
  };

  React.useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRtl, i18n.language]);

  const theme = useMemo(() => {
    const base = isDark ? nightThemeOptions : islamicThemeOptions;
    return createTheme({ ...base, direction: isRtl ? 'rtl' : 'ltr' });
  }, [isDark, isRtl]);

  return (
    <ThemeToggleContext.Provider value={{ isDark, toggleTheme }}>
      <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ThemeToggleContext.Provider>
  );
}
