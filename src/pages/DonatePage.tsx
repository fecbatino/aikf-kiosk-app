import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, Button, TextField, Grid, Container, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../database';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const donationAmounts = [5, 10, 20, 50, 100];
const donationCategories = [
  { value: 'general', labelKey: 'category_general', icon: '🕌', color: null },
  { value: 'education', labelKey: 'category_education', icon: '📚', color: null },
  { value: 'mosque_purchase', labelKey: 'category_mosque_purchase', icon: '🏛️', color: '#C9A84C' },
  { value: 'ramadan', labelKey: 'category_ramadan', icon: '🌙', color: '#2E7D32' },
];

function DonatePage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showSnackbar } = useSnackbar();

  // Step state: 0 = Amount/Category, 1 = Donor Info, 2 = Payment/QR Code
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [amount, setAmount] = useState<number | string>('');
  const [customAmount, setCustomAmount] = useState<number | string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(donationCategories[0].value);
  const [customAmountError, setCustomAmountError] = useState(false);
  const [customAmountErrorMessage, setCustomAmountErrorMessage] = useState('');

  // Donor states
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorNameError, setDonorNameError] = useState(false);
  const [donorEmailError, setDonorEmailError] = useState(false);

  // QR Code states
  const [sepaQrValue, setSepaQrValue] = useState<string>('');
  const [paymentLinkQrValue, setPaymentLinkQrValue] = useState<string>('');

  // Thank you screen states
  const [showThankYou, setShowThankYou] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const timerRef = useRef<any>(null);

  const hasValidAmount = Number(amount || customAmount) > 0 && !customAmountError;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const validateAmount = (value: string | number): boolean => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue <= 0) {
      setCustomAmountError(true);
      setCustomAmountErrorMessage(t('invalid_amount_error'));
      return false;
    } else {
      setCustomAmountError(false);
      setCustomAmountErrorMessage('');
      return true;
    }
  };

  const generateBothQrCodes = (value: number, category: string) => {
    const purpose = `Spende AIKF - ${t(`category_${category}`)}`;
    setSepaQrValue(`BCD\n001\n1\nSCT\n${settings.sepaBic}\n${settings.sepaName}\n${settings.sepaIban}\nEUR${value.toFixed(2)}\n${purpose}`);
    setPaymentLinkQrValue(`${settings.paymentLink}?amount=${value}&category=${category}`);
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    setCustomAmount('');
    setCustomAmountError(false);
    setCustomAmountErrorMessage('');
  };

  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomAmount(value);
    setAmount('');
    validateAmount(value);
  };

  const handleCategorySelect = (newCategory: string) => {
    setSelectedCategory(newCategory);
  };

  // Navigating between steps
  const handleNextToDonor = () => {
    const finalAmount = amount || customAmount;
    if (validateAmount(finalAmount)) {
      setActiveStep(1);
    }
  };

  const handleNextToPayment = () => {
    let isValid = true;

    if (!isAnonymous) {
      if (!donorName.trim()) {
        setDonorNameError(true);
        isValid = false;
      } else {
        setDonorNameError(false);
      }

      if (donorEmail.trim() && !donorEmail.includes('@')) {
        setDonorEmailError(true);
        isValid = false;
      } else {
        setDonorEmailError(false);
      }
    } else {
      setDonorNameError(false);
      setDonorEmailError(false);
    }

    if (isValid) {
      const finalAmount = amount || customAmount;
      generateBothQrCodes(parseFloat(finalAmount as string), selectedCategory);
      setActiveStep(2);
    }
  };

  const handleFinishDonation = async () => {
    const finalAmount = amount ? Number(amount) : Number(customAmount);
    
    // Save donation to database
    try {
      await db.donations.add({
        amount: finalAmount,
        qrCodeValue: sepaQrValue,
        timestamp: new Date(),
        category: selectedCategory,
        donorName: isAnonymous ? 'Anonym' : donorName.trim(),
        donorEmail: isAnonymous ? '' : donorEmail.trim(),
      });
    } catch (err) {
      console.error('Fehler beim Speichern der Spende:', err);
      showSnackbar(t('donation_saved_error'), 'error');
    }

    // Trigger Thank You Screen and Countdown
    setShowThankYou(true);
    setCountdown(8);

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          resetKiosk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetKiosk = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAmount('');
    setCustomAmount('');
    setSepaQrValue('');
    setPaymentLinkQrValue('');
    setCustomAmountError(false);
    setCustomAmountErrorMessage('');
    setDonorName('');
    setDonorEmail('');
    setIsAnonymous(false);
    setDonorNameError(false);
    setDonorEmailError(false);
    setActiveStep(0);
    setShowThankYou(false);
  };


  if (showThankYou) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          mt: { xs: 4, sm: 8 },
          p: 6,
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.5s ease'
        }}>
          {/* Animated Success Checkmark / Heart SVG */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              bgcolor: 'rgba(10, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #10b981',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </Box>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'secondary.main', mb: 2 }}>
            {t('thank_you_title')}
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            {t('thank_you_subtitle')}
          </Typography>

          <Box sx={{
            py: 2,
            px: 3,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            mb: 4,
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {t('thank_you_reset_text', { count: countdown })}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={resetKiosk}
            sx={{
              minWidth: '200px',
              height: '54px',
              borderRadius: '27px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
            }}
          >
            {t('btn_reset_now')}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      
      {/* Custom Stepper Progress Indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 5, gap: 1 }}>
        {/* Step 1 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: activeStep === 0 ? 'primary.main' : 'rgba(255,255,255,0.05)',
            color: activeStep === 0 ? 'primary.contrastText' : 'text.secondary',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 800,
            border: activeStep === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: activeStep === 0 ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none',
          }}>1</Box>
          <Typography variant="body1" sx={{ fontWeight: activeStep === 0 ? 'bold' : '500', color: activeStep === 0 ? 'text.primary' : 'text.secondary' }}>
            {t('step_amount', 'Betrag')}
          </Typography>
        </Box>
        
        <Box sx={{ width: { xs: 20, sm: 50 }, height: '2px', bgcolor: activeStep > 0 ? 'primary.main' : 'rgba(255,255,255,0.1)' }} />
        
        {/* Step 2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: activeStep === 1 ? 'primary.main' : 'rgba(255,255,255,0.05)',
            color: activeStep === 1 ? 'primary.contrastText' : 'text.secondary',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 800,
            border: activeStep === 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: activeStep === 1 ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none',
          }}>2</Box>
          <Typography variant="body1" sx={{ fontWeight: activeStep === 1 ? 'bold' : '500', color: activeStep === 1 ? 'text.primary' : 'text.secondary' }}>
            {t('step_donor', 'Spenderdaten')}
          </Typography>
        </Box>
        
        <Box sx={{ width: { xs: 20, sm: 50 }, height: '2px', bgcolor: activeStep > 1 ? 'primary.main' : 'rgba(255,255,255,0.1)' }} />
        
        {/* Step 3 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: activeStep === 2 ? 'primary.main' : 'rgba(255,255,255,0.05)',
            color: activeStep === 2 ? 'primary.contrastText' : 'text.secondary',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 800,
            border: activeStep === 2 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: activeStep === 2 ? '0 0 12px rgba(6, 182, 212, 0.3)' : 'none',
          }}>3</Box>
          <Typography variant="body1" sx={{ fontWeight: activeStep === 2 ? 'bold' : '500', color: activeStep === 2 ? 'text.primary' : 'text.secondary' }}>
            {t('step_payment', 'Zahlung')}
          </Typography>
        </Box>
      </Box>

      {/* Main Workflow Panels */}
      {activeStep === 0 && (
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'left' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
              {t('step_amount_title', 'Spendenbetrag wählen')}
            </Typography>

            {/* Grid for Quick Amounts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {donationAmounts.map((val) => (
                <Grid size={{ xs: 4, sm: 2.4 }} key={val}>
                  <Button
                    variant={amount === val ? 'contained' : 'outlined'}
                    color={amount === val ? 'primary' : 'inherit'}
                    onClick={() => handleAmountChange(val)}
                    fullWidth
                    sx={{
                      height: '60px',
                      borderRadius: '12px',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      borderColor: amount === val ? 'primary.main' : 'rgba(255,255,255,0.1)',
                      color: amount === val ? 'primary.contrastText' : 'text.primary',
                      bgcolor: amount === val ? 'primary.main' : 'transparent',
                    }}
                  >
                    €{val}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Custom Amount input */}
            <TextField
              label={t('enter_custom_amount')}
              type="number"
              variant="outlined"
              fullWidth
              value={customAmount}
              onChange={handleCustomAmountChange}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  height: '56px',
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '1.15rem',
                  fontWeight: 700,
                }
              }}
              error={customAmountError}
              helperText={customAmountErrorMessage}
            />

            {/* Category selection list */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              {t('donation_category')}
            </Typography>
            
            <Grid container spacing={1.5} sx={{ mb: 4 }}>
              {donationCategories.map((c) => {
                const activeColor = c.color || '#06b6d4';
                const isActive = selectedCategory === c.value;
                return (
                  <Grid size={{ xs: 6, sm: 3 }} key={c.value}>
                    <Button
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => handleCategorySelect(c.value)}
                      fullWidth
                      sx={{
                        height: '72px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        flexDirection: 'column',
                        gap: 0.5,
                        borderColor: isActive ? activeColor : 'rgba(255,255,255,0.08)',
                        color: isActive ? '#ffffff' : 'text.secondary',
                        bgcolor: isActive ? activeColor : 'transparent',
                        boxShadow: isActive ? `0 4px 14px ${activeColor}55` : 'none',
                        '&:hover': {
                          bgcolor: isActive ? activeColor : `${activeColor}18`,
                          borderColor: activeColor,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{c.icon}</span>
                      <span>{t(c.labelKey)}</span>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Navigation Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextToDonor}
              disabled={!hasValidAmount}
              fullWidth
              sx={{
                height: '56px',
                borderRadius: '28px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: hasValidAmount ? '0 4px 14px rgba(6, 182, 212, 0.3)' : 'none'
              }}
            >
              {t('btn_next', 'Weiter')} ➔
            </Button>
          </Paper>
        </Container>
      )}

      {activeStep === 1 && (
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'left' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
              {t('step_donor_title', 'Spenderdaten eingeben')}
            </Typography>

            {/* Anonymous Toggle */}
            <Box sx={{
              mb: 3,
              p: 2,
              borderRadius: '12px',
              bgcolor: isAnonymous ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.01)',
              border: '1px solid',
              borderColor: isAnonymous ? 'primary.main' : 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) {
                        setDonorName('');
                        setDonorEmail('');
                        setDonorNameError(false);
                        setDonorEmailError(false);
                      }
                    }}
                    color="primary"
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 26 } }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {t('donate_anonymously', 'Anonym spenden')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('anonymous_caption')}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* Name Input */}
            <TextField
              label={t('donor_name_label', 'Vollständiger Name')}
              variant="outlined"
              fullWidth
              value={donorName}
              onChange={(e) => {
                setDonorName(e.target.value);
                if (e.target.value.trim()) setDonorNameError(false);
              }}
              disabled={isAnonymous}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': { borderRadius: '10px', height: '56px' }
              }}
              error={donorNameError}
              helperText={donorNameError ? t('donor_name_required', 'Bitte gib deinen Namen ein.') : ''}
            />

            {/* Email Input */}
            <TextField
              label={t('donor_email_label', 'E-Mail-Adresse (für Beleg)')}
              type="email"
              variant="outlined"
              fullWidth
              value={donorEmail}
              onChange={(e) => {
                setDonorEmail(e.target.value);
                if (!e.target.value.trim() || e.target.value.includes('@')) setDonorEmailError(false);
              }}
              disabled={isAnonymous}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': { borderRadius: '10px', height: '56px' }
              }}
              error={donorEmailError}
              helperText={donorEmailError ? t('donor_email_invalid', 'Bitte gib eine gültige E-Mail-Adresse ein.') : ''}
            />

            {/* Form actions */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setActiveStep(0)}
                  sx={{ height: '54px', borderRadius: '27px', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  ⬅ {t('btn_back', 'Zurück')}
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleNextToPayment}
                  sx={{
                    height: '54px',
                    borderRadius: '27px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  {t('btn_next', 'Weiter')} ➔
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3} sx={{ textAlign: 'left' }}>
          {/* Summary Panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
                {t('donation_summary', 'Zusammenfassung')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4, flex: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('donation_amount_summary', 'Spendenhöhe')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 850, color: 'primary.main' }}>
                    €{amount || customAmount}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('donation_category_summary', 'Kategorie')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t(`category_${selectedCategory}`)}
                  </Typography>
                </Box>

                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('donor_summary', 'Spender')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {isAnonymous ? t('anonymous', 'Anonym') : donorName}
                  </Typography>
                  {!isAnonymous && donorEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {donorEmail}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setActiveStep(1)}
                sx={{ height: '54px', borderRadius: '27px', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                ⬅ {t('btn_back', 'Zurück')}
              </Button>
            </Paper>
          </Grid>

          {/* Dual QR Code Panel */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                {t('scan_qr_code', 'QR-Code scannen und bezahlen')}
              </Typography>

              <Grid container spacing={3}>
                {/* SEPA QR Code */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '2px solid #2E7D32',
                    bgcolor: 'rgba(46, 125, 50, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    height: '100%',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#4CAF50', letterSpacing: 0.3, textAlign: 'center' }}>
                      Banküberweisung (SEPA)
                    </Typography>
                    {sepaQrValue ? (
                      <Box sx={{
                        p: 1.5,
                        bgcolor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }}>
                        <QRCodeSVG value={sepaQrValue} size={180} level="H" includeMargin={false} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 213, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Lade...
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      Scanne mit deiner Banking-App
                    </Typography>
                  </Paper>
                </Grid>

                {/* Payment Link QR Code */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '2px solid #C9A84C',
                    bgcolor: 'rgba(201, 168, 76, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    height: '100%',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#C9A84C', letterSpacing: 0.3, textAlign: 'center' }}>
                      Online bezahlen
                    </Typography>
                    {paymentLinkQrValue ? (
                      <Box sx={{
                        p: 1.5,
                        bgcolor: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }}>
                        <QRCodeSVG value={paymentLinkQrValue} size={180} level="H" includeMargin={false} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 213, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Lade...
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      PayPal · Kreditkarte · Apple Pay
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleFinishDonation}
                fullWidth
                sx={{
                  mt: 4,
                  height: '56px',
                  borderRadius: '28px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)',
                  color: '#ffffff'
                }}
              >
                {t('btn_done')}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

    </Container>
  );
}

export default DonatePage;
