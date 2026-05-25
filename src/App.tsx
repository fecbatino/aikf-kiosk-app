import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DonatePage from './pages/DonatePage';
import DonationHistoryPage from './pages/DonationHistoryPage';
import { useAuth } from './contexts/AuthContext';

const AdminPage = React.lazy(() => import('./pages/AdminPage'));

function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();

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
      <AppBar position="static" color="transparent" elevation={0} sx={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        bgcolor: 'background.paper'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: 3 }}>
          <Typography variant="h5" component="div" sx={{
            fontWeight: 800,
            color: 'primary.main',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            userSelect: 'none'
          }}>
            {t('kiosk_title')}
          </Typography>
          
          {/* Touch-Optimized Language Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Globe Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, color: '#9ca3af', marginRight: '4px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            
            {['de', 'en', 'fr'].map((lang) => (
              <Button
                key={lang}
                size="small"
                variant={i18n.language === lang ? 'contained' : 'outlined'}
                color={i18n.language === lang ? 'primary' : 'inherit'}
                onClick={() => i18n.changeLanguage(lang)}
                sx={{
                  minWidth: '42px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  padding: 0,
                  borderColor: i18n.language === lang ? 'primary.main' : 'rgba(255,255,255,0.1)',
                  color: i18n.language === lang ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: i18n.language === lang ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
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
