import { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, AdminStats } from '../api';
import PaymentSetup from '../components/PaymentSetup';
export default function AdminPage() {
  const { isAuthenticated, mustChangePassword, adminEmail, login, logout, getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => {
    const token = getToken();
    if (!isAuthenticated) { setStats(null); return; }
    if (isAuthenticated && token) adminApi.stats(token).then(setStats).catch(() => setError('Statistik derzeit nicht erreichbar.'));
  }, [isAuthenticated, getToken]);
  if (mustChangePassword || showPasswordForm) return <Paper sx={{ maxWidth: 520, p: 4, mx: 'auto' }}>
    <Typography component="h1" variant="h4" gutterBottom>Admin-Passwort erneuern</Typography>
    <Alert severity={mustChangePassword ? 'warning' : 'info'} sx={{ mb: 3 }}>{mustChangePassword ? 'Das bisherige Passwort erfüllt die neuen Mindestanforderungen nicht. Vor dem Zugriff auf Spendendaten ist ein neues Passwort mit mindestens 14 Zeichen erforderlich.' : 'Verwenden Sie ein eigenes Passwort mit mindestens 14 Zeichen. Anschließend werden alle bestehenden Admin-Sitzungen ungültig.'}</Alert>
    <Box component="form" onSubmit={async event => {
      event.preventDefault(); setError('');
      if (newPassword !== confirmation || newPassword.length < 14) { setError('Mindestens 14 Zeichen verwenden; beide neuen Eingaben müssen übereinstimmen.'); return; }
      setBusy(true);
      try { await adminApi.changePassword(password, newPassword, getToken() || ''); setPassword(''); setNewPassword(''); setConfirmation(''); setPasswordChanged(true); setShowPasswordForm(false); logout(); }
      catch { setError('Passwort konnte nicht geändert werden. Bisheriges Passwort prüfen.'); }
      finally { setBusy(false); }
    }}>
      <TextField fullWidth required type="password" autoComplete="current-password" label="Bisheriges Passwort" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} />
      <TextField fullWidth required type="password" autoComplete="new-password" label="Neues Passwort (mindestens 14 Zeichen)" value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={{ mb: 2 }} slotProps={{ htmlInput: { minLength: 14, maxLength: 128 } }} />
      <TextField fullWidth required type="password" autoComplete="new-password" label="Neues Passwort wiederholen" value={confirmation} onChange={e => setConfirmation(e.target.value)} sx={{ mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Button type="submit" variant="contained" fullWidth disabled={busy}>Passwort speichern und neu anmelden</Button><Button onClick={() => { setShowPasswordForm(false); setPassword(''); setNewPassword(''); setConfirmation(''); if (mustChangePassword) logout(); }} sx={{ mt: 1 }}>Abbrechen</Button>
    </Box>
  </Paper>;
  if (!isAuthenticated) return <Paper sx={{ maxWidth: 440, p: 4, mx: 'auto', border: '1px solid', borderColor: 'divider' }}>
    <Typography component="h1" variant="h4" gutterBottom>Administration</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Mit dem AIKF-Administratorkonto anmelden.</Typography>
    {passwordChanged && <Alert severity="success" sx={{ mb: 3 }}>Passwort geändert. Bitte mit dem neuen Passwort anmelden.</Alert>}
    <Box component="form" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); try { if (!await login(email.trim(), password)) setError('Anmeldung fehlgeschlagen. Zugangsdaten prüfen oder später erneut versuchen.'); setPassword(''); } finally { setBusy(false); } }}>
      <TextField fullWidth required type="email" label="E-Mail-Adresse" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />
      <TextField fullWidth required type="password" label="Passwort" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Button type="submit" variant="contained" fullWidth disabled={busy}>{busy ? 'Anmeldung läuft …' : 'Anmelden'}</Button>
    </Box>
  </Paper>;
  const money = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  return <>
    <Typography component="h1" variant="h3">Spenden im Überblick</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>{adminEmail} · Beträge enthalten ausschließlich bestätigte Zahlungen.</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    <div className="stats-grid">{[['Bestätigte Spenden', stats ? money(stats.totalAmount) : '…'], ['Anzahl bestätigt', stats?.totalDonations ?? '…'], ['Dieser Monat', stats ? money(stats.thisMonthAmount) : '…']].map(([title, value]) => <Paper key={title} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}><Typography color="text.secondary" variant="body2">{title}</Typography><Typography variant="h4" sx={{ mt: 1 }}>{value}</Typography></Paper>)}</div>
    <Button component={Link} to="/history" variant="contained" sx={{ mt: 3 }}>Spenden prüfen, abgleichen und exportieren</Button>
    <Button onClick={() => setShowPasswordForm(true)} sx={{ mt: 3, ml: 2 }}>Passwort ändern</Button>
    <PaymentSetup token={getToken() || ''} />
  </>;
}
