import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './i18n';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './ErrorBoundary';
import { SnackbarProvider } from './contexts/SnackbarContext';

// Importiere die Service Worker Registrierung
import { registerSW } from 'virtual:pwa-register';

// Registriere den Service Worker nur im Produktionsmodus
if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log('Neue Inhalte verfügbar, bitte aktualisieren.');
    },
    onOfflineReady() {
      console.log('App ist jetzt offline-fähig.');
    },
  });
} else {
  // Im Entwicklungsmodus alle Service Worker deinstallieren, um Caching-Probleme zu vermeiden
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('Dev SW unregistered');
        });
      }
    });
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#06b6d4', // Teal/Cyan
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Emerald Green
      contrastText: '#ffffff',
    },
    background: {
      default: '#0b0f19', // Midnight Blue
      paper: '#151c2c',  // Slate Blue for Cards/Paper
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1.05rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          minHeight: '48px', // Ensure good touch target size
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
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
          // Customize scrollbars
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0b0f19',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#1f2937',
            borderRadius: '4px',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <SettingsProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <SnackbarProvider>
                <App />
              </SnackbarProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </SettingsProvider>
    </HashRouter>
  </React.StrictMode>,
)
