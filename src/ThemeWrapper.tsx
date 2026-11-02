import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';
const rtl = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
const ltr = createCache({ key: 'muiltr' });
export const ThemeToggleContext = createContext({ isDark: false, toggleTheme: () => {}, resetTheme: () => {} });
export const useThemeToggle = () => useContext(ThemeToggleContext);
export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('aikf-theme') === 'dark');
  const isRtl = i18n.language === 'ar';
  function toggleTheme() { setIsDark(previous => { localStorage.setItem('aikf-theme', !previous ? 'dark' : 'light'); return !previous; }); }
  const resetTheme = React.useCallback(() => { localStorage.removeItem('aikf-theme'); setIsDark(false); }, []);
  React.useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'; document.documentElement.lang = i18n.language;
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isRtl, i18n.language, isDark]);
  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: { mode: isDark ? 'dark' : 'light',
      primary: { main: isDark ? '#a1d8bd' : '#145c46', contrastText: isDark ? '#112b23' : '#ffffff' },
      secondary: { main: '#a18048' },
      background: { default: isDark ? '#111c18' : '#f5f7f4', paper: isDark ? '#1b2a23' : '#ffffff' },
      text: { primary: isDark ? '#f1f6f2' : '#203c31', secondary: isDark ? '#b4c7bc' : '#61716a' } },
    shape: { borderRadius: 12 },
    typography: { fontFamily: isRtl ? '"Noto Sans Arabic Variable", sans-serif' : '"Inter Variable", sans-serif',
      h3: { fontFamily: isRtl ? '"Noto Sans Arabic Variable", sans-serif' : '"Manrope Variable", sans-serif', fontWeight: 650, letterSpacing: '-.04em' },
      h4: { fontFamily: isRtl ? '"Noto Sans Arabic Variable", sans-serif' : '"Manrope Variable", sans-serif', fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-.035em' },
      h5: { fontWeight: 650, letterSpacing: '-.02em' }, body1: { lineHeight: 1.7 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-.015em' } },
    components: {
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 48, borderRadius: 12, padding: '12px 20px', fontSize: '0.95rem', transition: 'background-color .18s, border-color .18s, box-shadow .18s' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 }, notchedOutline: { borderColor: isDark ? '#3b5145' : '#d9e1db' } } },
      MuiFormHelperText: { styleOverrides: { root: { fontSize: '.875rem', lineHeight: 1.6, marginTop: 7, marginInlineStart: 0 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12, fontSize: '.85rem', lineHeight: 1.65 } } },
    },
  }), [isDark, isRtl]);
  return <ThemeToggleContext.Provider value={{ isDark, toggleTheme, resetTheme }}><CacheProvider value={isRtl ? rtl : ltr}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></CacheProvider></ThemeToggleContext.Provider>;
}
