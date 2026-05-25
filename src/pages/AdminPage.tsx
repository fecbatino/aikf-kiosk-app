import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Container, Alert, Paper, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { db } from '../database';
import { exportDonationsCsv } from '../utils/exportCsv';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const { t } = useTranslation();
  const { isAuthenticated, login, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Login state
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Settings form state
  const [sepaName, setSepaName] = useState('');
  const [sepaIban, setSepaIban] = useState('');
  const [sepaBic, setSepaBic] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [adminPin, setAdminPin] = useState('');

  // Initialize form fields when settings load or login succeeds
  useEffect(() => {
    if (isAuthenticated) {
      setSepaName(settings.sepaName);
      setSepaIban(settings.sepaIban);
      setSepaBic(settings.sepaBic);
      setPaymentLink(settings.paymentLink);
      setAdminPin(settings.adminPin);
    }
  }, [isAuthenticated, settings]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pin);
    if (success) {
      setLoginError('');
      setPin('');
      showSnackbar('Erfolgreich als Administrator angemeldet.', 'success');
    } else {
      setLoginError(t('admin_invalid_pin_error'));
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sepaName || !sepaIban || !sepaBic || !paymentLink || !adminPin) {
      showSnackbar('Bitte füllen Sie alle Felder aus.', 'error');
      return;
    }
    
    updateSettings({
      sepaName,
      sepaIban,
      sepaBic,
      paymentLink,
      adminPin,
    });
    
    showSnackbar('Einstellungen erfolgreich gespeichert!', 'success');
  };

  const handleExportDonations = async () => {
    try {
      const donations = await db.donations.toArray();
      if (donations.length === 0) {
        showSnackbar('Keine Spenden in der Historie vorhanden.', 'info');
        return;
      }
      exportDonationsCsv(donations, t);
      showSnackbar('Daten erfolgreich als CSV exportiert!', 'success');
    } catch (err) {
      console.error('Fehler beim Export:', err);
      showSnackbar('Fehler beim Exportieren der Daten.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 8 } }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
            {t('admin_login_title')}
          </Typography>
          
          <Box component="form" onSubmit={handleLoginSubmit} noValidate>
            <TextField
              label={t('admin_pin_label')}
              type="password"
              variant="outlined"
              fullWidth
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  height: '56px',
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  letterSpacing: '0.2em'
                }
              }}
              autoFocus
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                height: '56px',
                borderRadius: '28px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                mb: 2,
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
              }}
            >
              {t('admin_login_button')}
            </Button>
          </Box>
          
          {loginError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
              {loginError}
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Top Welcome Card */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', mb: 4, textAlign: 'left' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          {t('admin_welcome_title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Verwalte die Einstellungen und den Datenexport des Spendenkiosks.
        </Typography>

        {/* Dashboard quick actions */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleExportDonations}
              sx={{ height: '54px', borderRadius: '12px' }}
            >
              📊 Spenden exportieren (CSV)
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => navigate('/history')}
              sx={{ height: '54px', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              👁️ Historie ansehen
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={logout}
              sx={{ height: '54px', borderRadius: '12px' }}
            >
              🚪 Abmelden
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Settings Form Card */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'left' }}>
        <Typography variant="h5" sx={{ fontWeight: 750, mb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5 }}>
          ⚙️ Kiosk-Einstellungen bearbeiten
        </Typography>

        <Box component="form" onSubmit={handleSaveSettings}>
          <Grid container spacing={3}>
            {/* SEPA Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SEPA Begünstigter (Name)"
                variant="outlined"
                fullWidth
                value={sepaName}
                onChange={(e) => setSepaName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* SEPA IBAN */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SEPA IBAN"
                variant="outlined"
                fullWidth
                value={sepaIban}
                onChange={(e) => setSepaIban(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* SEPA BIC */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SEPA BIC"
                variant="outlined"
                fullWidth
                value={sepaBic}
                onChange={(e) => setSepaBic(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Payment Link */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Online-Zahlungslink"
                variant="outlined"
                fullWidth
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Grid>

            {/* Admin PIN */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Admin-PIN"
                type="text"
                variant="outlined"
                fullWidth
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                helperText="Wird für den Administrator-Login am Kiosk verwendet."
              />
            </Grid>

            {/* Form actions */}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{
                  height: '54px',
                  borderRadius: '12px',
                  px: 4,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  color: '#ffffff'
                }}
              >
                💾 Einstellungen speichern
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default AdminPage;
