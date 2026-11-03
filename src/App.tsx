import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, Typography } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DonatePage from './pages/DonatePage';
import ImprintPage from './pages/ImprintPage';
import PrivacyPage from './pages/PrivacyPage';
import { useAuth } from './contexts/AuthContext';
import { useThemeToggle } from './ThemeWrapper';
import Icon from './components/Icon';
import LegalPage from './components/LegalPage';
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const DonationHistoryPage = React.lazy(() => import('./pages/DonationHistoryPage'));
// Each language in its own name and script, with its ISO code; flags would name countries, not languages.
const languages = [['de', 'DE', 'Deutsch'], ['en', 'EN', 'English'], ['fr', 'FR', 'Français'], ['ar', 'AR', 'العربية']] as const;
function App() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeToggle();
  const { pathname } = useLocation();
  const [legal, setLegal] = useState<'privacy' | 'imprint'>('privacy');
  const [legalOpen, setLegalOpen] = useState(false);
  useEffect(() => { window.dispatchEvent(new CustomEvent('kiosk-information', { detail: legalOpen })); }, [legalOpen]);
  const kiosk = ['/', '/donate', '/payment-return'].includes(pathname);
  useEffect(() => { if (kiosk && isAuthenticated) logout(); }, [kiosk, isAuthenticated, logout]);
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); }}>{t('skip_content')}</a>
    {isAuthenticated && <Box className="admin-bar"><Typography variant="body2">Administration</Typography><Button component={Link} to="/">Kiosk</Button><Button component={Link} to="/history">Spenden</Button><Button component={Link} to="/admin">Verwaltung</Button><Button onClick={logout}>Abmelden</Button></Box>}
    <header className="site-header">
      <div className="header-inner">
      <Link to="/" className="brand" onClick={event => { if (kiosk) { event.preventDefault(); window.dispatchEvent(new Event('kiosk-reset')); } }} aria-label={t('kiosk_title')}><span className="brand-symbol"><Icon name="hand" size={26} /></span><span><strong>AIKF<span className="brand-association"> e.V.</span></strong><small>{t('brand_subtitle')}</small></span></Link>
      <div className="header-actions">
        {kiosk && <Button className="reset-button" onClick={() => window.dispatchEvent(new Event('kiosk-reset'))} startIcon={<Icon name="reset" size={17} />}>{t('btn_cancel')}</Button>}
        <Button className="theme-button" onClick={toggleTheme} aria-label={t(isDark ? 'light_mode' : 'dark_mode')}><Icon name={isDark ? 'sun' : 'night'} size={20} /></Button>
        <div className="language-control"><Icon name="languages" size={18} />
        <Select className="language-select" size="small" value={i18n.language} onChange={event => i18n.changeLanguage(event.target.value)} inputProps={{ 'aria-label': t('select_language') }}
          renderValue={value => { const current = languages.find(item => item[0] === value); return <span lang={value}><span className="language-current-code">{current?.[1]}</span><span className="language-current-name">{current?.[2]}</span></span>; }}
          MenuProps={{ slotProps: { paper: { className: 'language-menu' } } }}>
          {languages.map(([code, short, name]) => <MenuItem key={code} value={code} lang={code}><span className="language-code" aria-hidden="true">{short}</span><span className="language-name">{name}</span>{i18n.language === code && <Icon name="check" size={18} />}</MenuItem>)}
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
    <footer className="site-footer"><span>{t('footer_copyright')}</span><nav aria-label={t('footer_links')}><Link to="/imprint" onClick={event => { if (kiosk) { event.preventDefault(); setLegal('imprint'); setLegalOpen(true); } }}>{t('footer_imprint')}</Link><Link to="/privacy" onClick={event => { if (kiosk) { event.preventDefault(); setLegal('privacy'); setLegalOpen(true); } }}>{t('footer_privacy')}</Link></nav></footer>
    <Dialog open={legalOpen} onClose={() => setLegalOpen(false)} fullWidth maxWidth="md" aria-labelledby="legal-title" scroll="paper">
      <DialogTitle id="legal-title" component="h2">{t(legal === 'privacy' ? 'footer_privacy' : 'footer_imprint')}</DialogTitle>
      <DialogContent dividers><LegalPage kind={legal} embedded /></DialogContent>
      <DialogActions><Button onClick={() => setLegalOpen(false)} startIcon={<Icon name="close" size={20} />}>{t('close_information')}</Button></DialogActions>
    </Dialog>
  </>;
}
export default App;
