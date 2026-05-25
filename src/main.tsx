import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './i18n';
import ThemeWrapper from './ThemeWrapper';
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <SettingsProvider>
        <AuthProvider>
          <ThemeWrapper>
            <ErrorBoundary>
              <SnackbarProvider>
                <App />
              </SnackbarProvider>
            </ErrorBoundary>
          </ThemeWrapper>
        </AuthProvider>
      </SettingsProvider>
    </HashRouter>
  </React.StrictMode>,
)
