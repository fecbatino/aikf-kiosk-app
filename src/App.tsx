import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DonatePage from './pages/DonatePage';
import DonationHistoryPage from './pages/DonationHistoryPage';
import { useAuth } from './contexts/AuthContext';
import { useThemeToggle } from './ThemeWrapper';

const AdminPage = React.lazy(() => import('./pages/AdminPage'));

function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeToggle();

  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const langOptions = [
    { code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
    { code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'FR', name: 'Français' },
    { code: 'ar', flag: '🇸🇦', label: 'AR', name: 'العربية' },
  ];

  const currentLang = langOptions.find(l => l.code === i18n.language) || langOptions[0];

  return (
    <>
      {/* Admin management top bar */}
      {isAuthenticated && (
        <Box sx={{
          bgcolor: 'rgba(6, 182, 212, 0.1)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
          py: 1,
          px: 3,
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <Typography variant="subtitle2" sx={{ color: 'primary.main', mr: 'auto', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            ADMIN MODUS
          </Typography>
          <Button size="small" variant="text" component={Link} to="/" sx={{ minHeight: '36px' }}>Kiosk-Ansicht</Button>
          <Button size="small" variant="text" component={Link} to="/history" sx={{ minHeight: '36px' }}>Spendenhistorie</Button>
          <Button size="small" variant="text" component={Link} to="/admin" sx={{ minHeight: '36px' }}>Einstellungen</Button>
          <Button size="small" variant="outlined" color="error" onClick={logout} sx={{ ml: 2, minHeight: '36px' }}>Abmelden</Button>
        </Box>
      )}

      {/* Main Kiosk Header */}
      <AppBar position="static" elevation={0} sx={{
        bgcolor: isDark ? '#0d1117' : 'primary.main',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: 3 }}>
          <Typography variant="h5" component="div" sx={{
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            userSelect: 'none'
          }}>
            {t('kiosk_title')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme toggle */}
            <Button
              onClick={toggleTheme}
              size="small"
              sx={{
                minWidth: '42px',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                padding: 0,
                fontSize: '1.2rem',
                color: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                mr: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
              }}
              title={isDark ? 'Islamisches Theme' : 'Nacht-Theme'}
            >
              {isDark ? '🕌' : '🌙'}
            </Button>

            {/* Language dropdown */}
            <Button
              onClick={(e) => setLangMenuAnchor(e.currentTarget)}
              size="small"
              sx={{
                height: '42px',
                borderRadius: '10px',
                px: 1.5,
                gap: 0.75,
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
              }}
            >
              🌐 {currentLang.label}
            </Button>

            <Menu
              anchorEl={langMenuAnchor}
              open={Boolean(langMenuAnchor)}
              onClose={() => setLangMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 190,
                    borderRadius: '12px',
                    bgcolor: isDark ? '#1a1f2e' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  }
                }
              }}
            >
              {langOptions.map((lang) => (
                <MenuItem
                  key={lang.code}
                  selected={i18n.language === lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setLangMenuAnchor(null);
                  }}
                  sx={{
                    gap: 1.5,
                    borderRadius: '8px',
                    mx: 0.5,
                    my: 0.25,
                    fontWeight: i18n.language === lang.code ? 700 : 400,
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <span style={{ fontWeight: 700, minWidth: '26px' }}>{lang.label}</span>
                  <span style={{ flex: 1, opacity: 0.7 }}>— {lang.name}</span>
                  {i18n.language === lang.code && (
                    <span style={{ color: isDark ? '#06b6d4' : '#1a5c38', fontWeight: 'bold' }}>✓</span>
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: { xs: '1.5rem', sm: '3rem' },
        textAlign: 'center',
      }}>
        <Routes>
          <Route path="/" element={<DonatePage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/history" element={<DonationHistoryPage />} />
          <Route path="/admin" element={
            <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>Lade Admin-Bereich...</Box>}>
              <AdminPage />
            </React.Suspense>
          } />
        </Routes>
      </Box>

      {/* Hidden admin login shortcut (subtle gear icon in bottom-right corner) */}
      <Button
        component={Link}
        to="/admin"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          minWidth: '40px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          padding: 0,
          color: 'text.secondary',
          opacity: 0.15,
          zIndex: 1000,
          transition: 'opacity 0.2s',
          '&:hover': {
            opacity: 0.7,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          },
        }}
        aria-label="Admin Login"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </Button>
    </>
  );
}

export default App;
