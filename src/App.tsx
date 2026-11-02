import React from 'react';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DonatePage from './pages/DonatePage';
import ImprintPage from './pages/ImprintPage';
import PrivacyPage from './pages/PrivacyPage';
import { useAuth } from './contexts/AuthContext';
import { useThemeToggle } from './ThemeWrapper';
import Icon from './components/Icon';
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const DonationHistoryPage = React.lazy(() => import('./pages/DonationHistoryPage'));
function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeToggle();
  const { pathname } = useLocation();
  const kiosk = ['/', '/donate', '/payment-return'].includes(pathname);
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); }}>{t('skip_content')}</a>
    {isAuthenticated && <Box className="admin-bar"><Typography variant="body2">Administration</Typography><Button component={Link} to="/">Kiosk</Button><Button component={Link} to="/history">Spenden</Button><Button component={Link} to="/admin">Verwaltung</Button><Button onClick={logout}>Abmelden</Button></Box>}
    <header className="site-header">
      <div className="header-inner">
      <Link to="/" className="brand" onClick={event => { if (kiosk) { event.preventDefault(); window.dispatchEvent(new Event('kiosk-reset')); } }} aria-label={t('kiosk_title')}><span className="brand-symbol"><Icon name="hand" size={26} /></span><span><strong>AIKF<span className="brand-association"> e.V.</span></strong><small>{t('brand_subtitle')}</small></span></Link>
      <div className="header-actions">
        {kiosk && <Button className="reset-button" onClick={() => window.dispatchEvent(new Event('kiosk-reset'))} startIcon={<Icon name="reset" size={17} />}>{t('btn_cancel')}</Button>}
        <Button className="theme-button" onClick={toggleTheme} aria-label={t(isDark ? 'light_mode' : 'dark_mode')}><Icon name={isDark ? 'sun' : 'night'} size={20} /></Button>
        <div className="language-control"><Icon name="globe" size={18} />
        <Select className="language-select" size="small" value={i18n.language} onChange={event => i18n.changeLanguage(event.target.value)} inputProps={{ 'aria-label': t('select_language') }}>
          <MenuItem value="de">Deutsch</MenuItem><MenuItem value="en">English</MenuItem><MenuItem value="fr">Français</MenuItem><MenuItem value="ar">العربية</MenuItem>
        </Select>
        </div>
      </div>
      </div>
    </header>
    <main id="main" tabIndex={-1} className={`main-content ${kiosk ? 'kiosk-content' : 'document-content'}`}>
      <React.Suspense fallback={<Typography>{t('loading')}</Typography>}>
        <Routes>
          <Route path="/" element={<DonatePage />} /><Route path="/donate" element={<DonatePage />} /><Route path="/payment-return" element={<DonatePage />} />
          <Route path="/admin" element={<AdminPage />} /><Route path="/history" element={<DonationHistoryPage />} />
          <Route path="/imprint" element={<ImprintPage />} /><Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Link to="/">{t('home')}</Link>} />
        </Routes>
      </React.Suspense>
    </main>
    <footer className="site-footer"><span>{t('footer_copyright')}</span><nav aria-label={t('footer_links')}><Link to="/imprint">{t('footer_imprint')}</Link><Link to="/privacy">{t('footer_privacy')}</Link></nav></footer>
  </>;
}
export default App;
