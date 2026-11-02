import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { donationsApi, paymentsApi, PaymentConfig } from '../api';
import config from '../config';
import Icon from '../components/Icon';
import CommunityIllustration from '../components/CommunityIllustration';
import { donationReference, giroCode, parseAmount, PaymentAttempt, restoredAttempt, validIban } from '../utils/payment';

const categories = [ ['general', 'mosque'], ['education', 'book'], ['mosque_purchase', 'bank'], ['ramadan', 'moon'] ];
export default function DonatePage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const initial = useRef(restoredAttempt());
  const [step, setStep] = useState(initial.current ? 2 : 0);
  const [value, setValue] = useState(String(initial.current?.amount || ''));
  const [category, setCategory] = useState(initial.current?.category || 'general');
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'sepa' | 'online' | 'terminal'>(initial.current?.method || 'sepa');
  const [attempt, setAttempt] = useState<PaymentAttempt | null>(initial.current);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'paid' | 'pending' | 'processing' | null>(null);
  const [status, setStatus] = useState('pending');
  const [idle, setIdle] = useState(180);
  const [countdown, setCountdown] = useState(15);
  const requestKey = useRef(crypto.randomUUID());
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const amount = parseAmount(value);
  const money = (number: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(number);
  const bank = category === 'mosque_purchase' ? config.mosqueSepa : config.sepa;
  const bankReady = !!bank && validIban(bank.iban) && !!bank.name;
  const onlineReady = !!paymentConfig?.online;
  const terminalReady = !!(paymentConfig?.terminal && paymentConfig.paired);
  const reference = donationReference(category, attempt?.donationId || requestKey.current);
  const input = { amount: amount || 0, category, donorName: anonymous ? 'Anonym' : name.trim(), donorEmail: anonymous ? '' : email.trim() };

  const reset = useCallback(() => {
    sessionStorage.removeItem('aikf-payment');
    setAttempt(null); setValue(''); setCategory('general'); setName(''); setEmail(''); setAnonymous(true);
    setStep(0); setMethod('sepa'); setDone(null); setError(''); setStatusError(false); setIdle(180); setStatus('pending');
    requestKey.current = crypto.randomUUID();
    navigate('/', { replace: true });
  }, [navigate]);

  const cancel = useCallback(async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    try {
      if (attempt && !done) {
        const result = await paymentsApi.cancel(attempt.donationId, attempt.token);
        if (result.status === 'completed') { setDone('paid'); return; }
        if (result.processing) { setDone('processing'); return; }
        if (result.status === 'pending') throw new Error('PAYMENT_PROCESSING');
      }
      reset();
    } catch { setError(t('payment_cancel_error')); setIdle(180); }
    finally { locked.current = false; setBusy(false); }
  }, [attempt, done, reset, t]);

  useEffect(() => {
    const handle = () => { void cancel(); };
    window.addEventListener('kiosk-reset', handle);
    return () => window.removeEventListener('kiosk-reset', handle);
  }, [cancel]);
  useEffect(() => { paymentsApi.config().then(setPaymentConfig).catch(() => setStatusError(true)); }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step, done]);
  useEffect(() => {
    if (location.pathname !== '/payment-return') return;
    const returned = restoredAttempt();
    if (returned) { setAttempt(returned); setMethod(returned.method); setStep(2); }
  }, [location.pathname, location.search]);
  useEffect(() => {
    const activity = () => setIdle(180);
    window.addEventListener('pointerdown', activity); window.addEventListener('keydown', activity);
    const timer = window.setInterval(() => setIdle(x => Math.max(0, x - 1)), 1000);
    return () => { clearInterval(timer); window.removeEventListener('pointerdown', activity); window.removeEventListener('keydown', activity); };
  }, []);
  useEffect(() => { if (idle === 0 && (step > 0 || value) && !busy && !done) void cancel(); }, [idle, step, value, busy, done, cancel]);
  useEffect(() => {
    if (!done) return;
    setCountdown(15);
    const timer = window.setInterval(() => setCountdown(x => Math.max(0, x - 1)), 1000);
    return () => clearInterval(timer);
  }, [done]);
  useEffect(() => { if (done && countdown === 0) reset(); }, [done, countdown, reset]);
  useEffect(() => {
    if (!attempt || done) return;
    let stopped = false;
    let timer: number;
    const poll = async () => {
      try {
        const result = await paymentsApi.status(attempt.donationId, attempt.token);
        if (stopped) return;
        setStatusError(false); setStatus(result.status); setValue(String(result.amount)); setCategory(result.category);
        if (result.status === 'completed') { setDone('paid'); return; }
        if (result.processing) { setDone('processing'); return; }
        if (result.attemptFailed) { setStatus('failed'); return; }
        if (result.status === 'failed' || result.status === 'cancelled') return;
      } catch { if (!stopped) setStatusError(true); }
      if (!stopped) timer = window.setTimeout(poll, 4000);
    };
    void poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [attempt, done]);

  function changeAmount(next: string) { setValue(next); setError(''); requestKey.current = crypto.randomUUID(); }
  function next() {
    if (!amount) { setError(t('amount_limits')); return; }
    if (step === 1 && !anonymous && (!name.trim() || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))) {
      setError(t('donor_validation')); return;
    }
    setError(''); requestKey.current = crypto.randomUUID(); setStep(step + 1);
  }
  async function beginPayment() {
    if (locked.current || !amount) return;
    locked.current = true; setBusy(true); setError('');
    try {
      if (method === 'sepa') {
        await donationsApi.create({ ...input, paymentMethod: 'sepa' }, requestKey.current);
        setDone('pending');
      } else {
        const result = method === 'online' ? await paymentsApi.checkout({ ...input, locale: i18n.language }, requestKey.current) : await paymentsApi.terminal(input, requestKey.current);
        const nextAttempt = { ...result, method, amount, category };
        sessionStorage.setItem('aikf-payment', JSON.stringify(nextAttempt));
        setAttempt(nextAttempt); setStatus('pending');
        // Personal details are no longer needed on the shared kiosk.
        setName(''); setEmail(''); setAnonymous(true);
      }
    } catch { setError(t(method === 'sepa' ? 'transfer_record_error' : 'payment_error')); }
    finally { locked.current = false; setBusy(false); }
  }

  if (done) return <Paper className="thank-you" elevation={0}>
    <div className="success-mark"><Icon name={done === 'paid' ? 'check' : 'heart'} size={40} /></div>
    <Typography component="h1" variant="h3" ref={heading} tabIndex={-1}>{t('thank_you_title')}</Typography>
    <Typography className="thank-you-amount">{money(amount || 0)}</Typography>
    <Typography color="text.secondary">{t(done === 'paid' ? 'payment_confirmed' : done === 'processing' ? 'payment_processing' : 'transfer_pending')}</Typography>
    <Button variant="contained" onClick={reset} sx={{ mt: 4 }}>{t('new_donation')}</Button>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>{t('thank_you_reset_text', { count: countdown })}</Typography>
  </Paper>;

  return <div className="donation-layout">
    <aside className="impact-panel">
      <div className="impact-intro">
      <span className="eyebrow"><span className="eyebrow-dot" />{t('community_eyebrow')}</span>
      <Typography component="h1" className="impact-title">{t('impact_title')}</Typography>
      <Typography className="impact-copy">{t('impact_copy')}</Typography>
      </div>
      <div className="impact-art"><CommunityIllustration /></div>
      <div className="impact-trust"><Icon name="users" size={20} /><span>{t('impact_trust')}</span></div>
      <div className="summary-block" aria-live="polite">
        <span className="eyebrow">{t('your_donation')}</span>
        <strong className={`summary-amount ${amount ? '' : 'empty-amount'} ${amount && amount >= 1000 ? 'large-amount' : ''}`}>{amount ? money(amount) : '—'}</strong>
        <span className="summary-category"><Icon name={categories.find(item => item[0] === category)?.[1] || 'heart'} size={15} />{t(`category_${category}`)}</span>
      </div>
    </aside>
    <Paper component="section" elevation={0} className="donation-card">
      <ol className="step-list" aria-label={t('donation_progress')}>
        {['step_amount', 'step_donor', 'step_payment'].map((key, index) => <li key={key} className={step >= index ? 'active' : ''} aria-current={step === index ? 'step' : undefined}>
          <span className="step-number">{step > index ? <Icon name="check" size={16} /> : index + 1}</span><span>{t(key)}</span>
        </li>)}
      </ol>
      <Typography variant="h4" component="h2" ref={heading} tabIndex={-1} className="step-heading">{t(step === 0 ? 'step_amount_title' : step === 1 ? 'step_donor_title' : 'select_payment_method')}</Typography>
      <Typography color="text.secondary" className="step-description">{t(step === 0 ? 'amount_description' : step === 1 ? 'donor_description' : 'payment_description')}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {idle < 30 && <Alert severity="warning" action={<Button onClick={() => setIdle(180)}>{t('continue_session')}</Button>}>{t('idle_warning', { count: idle })}</Alert>}
      {step === 0 && <>
        <div className="amount-grid" role="group" aria-label={t('donation_amount')}>
          {[5, 10, 20, 50, 100].map(number => <Button key={number} aria-pressed={value === String(number)} variant={value === String(number) ? 'contained' : 'outlined'} onClick={() => changeAmount(String(number))}><span className="amount-currency">€</span><span className="amount-number">{number}</span></Button>)}
        </div>
        <TextField className="custom-amount" fullWidth label={t('enter_custom_amount')} value={value} onChange={event => changeAmount(event.target.value)} error={!!value && !amount} helperText={t('amount_limits')} slotProps={{ input: { startAdornment: <InputAdornment position="start">€</InputAdornment> }, htmlInput: { inputMode: 'decimal', maxLength: 8, autoComplete: 'off' } }} />
        <Typography className="section-label" component="h3" variant="subtitle1">{t('donation_category')}</Typography>
        <div className="category-grid" role="group" aria-label={t('donation_category')}>
          {categories.map(([id, icon]) => <Button key={id} className={category === id ? 'category selected' : 'category'} aria-pressed={category === id} onClick={() => { setCategory(id); requestKey.current = crypto.randomUUID(); }}>
            <span className="category-icon"><Icon name={icon} size={24} /></span><span className="category-label">{t(`category_${id}`)}</span><span className="selection-check">{category === id && <Icon name="check" size={11} />}</span>
          </Button>)}
        </div>
        <Button className="primary-action" fullWidth variant="contained" disabled={!amount} onClick={next} endIcon={<Icon name="arrow" size={20} />}>{t('btn_next')}</Button>
      </>}
      {step === 1 && <Box component="form" onSubmit={event => { event.preventDefault(); next(); }}>
        <div className={`anonymous-choice ${anonymous ? 'selected' : ''}`}><span className="donor-choice-icon"><Icon name="hand" size={28} /></span><div><FormControlLabel control={<Checkbox checked={anonymous} onChange={event => { setAnonymous(event.target.checked); setName(''); setEmail(''); }} />} label={t('donate_anonymously')} /><Typography variant="body2" color="text.secondary">{t('anonymous_caption')}</Typography></div></div>
        {!anonymous && <div className="donor-fields">
          <TextField required label={t('donor_name_label')} value={name} onChange={e => setName(e.target.value)} fullWidth slotProps={{ htmlInput: { maxLength: 120, autoComplete: 'off' } }} />
          <TextField type="email" label={t('email_optional')} value={email} onChange={e => setEmail(e.target.value)} fullWidth helperText={t('email_hint')} slotProps={{ htmlInput: { maxLength: 254, autoComplete: 'off' } }} />
        </div>}
        <div className="privacy-note"><Icon name="lock" size={19} /><span>{t('data_note')}</span></div>
        <div className="step-actions"><Button onClick={() => setStep(0)}>{t('btn_back')}</Button><Button variant="contained" type="submit" endIcon={<Icon name="arrow" size={20} />}>{t('btn_next')}</Button></div>
      </Box>}
      {step === 2 && <>
        {paymentConfig?.testMode && <Alert severity="warning" sx={{ mb: 2 }}>{t('test_mode')}</Alert>}
        {statusError && <Alert severity="warning" sx={{ mb: 2 }}>{t(attempt ? 'status_unavailable' : 'config_unavailable')}</Alert>}
        {!attempt ? <>
          <div className="payment-options" role="group" aria-label={t('select_payment_method')}>
            {([['sepa', 'bank', 'payment_method_sepa', 'transfer_description', bankReady], ['online', 'phone', 'online_title', 'online_description', onlineReady], ['terminal', 'card', 'terminal_title', 'terminal_description', terminalReady]] as const).map(([id, icon, title, description, available]) => <Button key={id} className={method === id ? 'payment-option selected' : 'payment-option'} aria-pressed={method === id} disabled={!available || busy} onClick={() => { if (method !== id) { requestKey.current = crypto.randomUUID(); setMethod(id); } setError(''); }}>
              <span className="method-icon"><Icon name={icon} size={25} /></span><span className="method-text"><strong>{t(title)}</strong><span>{t(available ? description : 'currently_unavailable')}</span></span>{method === id && <Icon name="check" size={19} />}
            </Button>)}
          </div>
          {!onlineReady && !terminalReady && paymentConfig && <Typography className="payment-availability" color="text.secondary">{t('payments_setup_note')}</Typography>}
          {method === 'sepa' && bankReady && amount && <div className="transfer-panel">
            <div className="qr-frame"><QRCodeSVG value={giroCode(bank, amount, reference)} size={176} marginSize={4} level="M" title={t('bank_qr_title')} /></div>
            <div className="bank-details">
              <strong className="bank-instruction">{t('scan_banking')}</strong>
              <div className="bank-field"><span>{t('bank_recipient')}</span><strong>{bank.name}</strong></div>
              <div className="bank-field"><span>IBAN</span><code dir="ltr">{bank.iban.match(/.{1,4}/g)?.join(' ')}</code></div>
              <div className="bank-field"><span>BIC</span><code dir="ltr">{bank.bic}</code></div>
              <div className="bank-field"><span>{t('reference')}</span><strong className="bank-reference-text" dir="ltr">{reference}</strong></div>
              <small>{t('transfer_no_confirmation')}</small>
            </div>
          </div>}
          <div className="step-actions"><Button disabled={busy} onClick={() => { setStep(1); setError(''); requestKey.current = crypto.randomUUID(); }}>{t('btn_back')}</Button><Button variant="contained" disabled={busy || !(method === 'sepa' ? bankReady : method === 'online' ? onlineReady : terminalReady)} onClick={beginPayment}>{busy ? <CircularProgress size={22} color="inherit" /> : t(method === 'sepa' ? 'transfer_record' : method === 'online' ? 'prepare_checkout' : 'start_terminal')}</Button></div>
        </> : <div className="active-payment">
          <Typography variant="h6">{t(attempt.method === 'online' ? 'scan_phone' : 'present_card')}</Typography>
          {attempt.url && status === 'pending' && <><div className="qr-frame"><QRCodeSVG value={attempt.url} size={210} marginSize={4} title={t('scan_phone')} /></div><Button component="a" href={attempt.url} variant="contained">{t('open_checkout')}</Button></>}
          {status === 'pending' ? <div className="waiting-status"><CircularProgress size={18} /><span>{t('awaiting_payment')}</span></div> : <Alert severity="warning">{t('payment_not_completed')}</Alert>}
          <Typography variant="body2" color="text.secondary">{t('payment_safety_note')}</Typography>
          <Button onClick={() => void cancel()} disabled={busy} variant="outlined">{t('cancel_payment')}</Button>
        </div>}
      </>}
      <div className="secure-footer"><Icon name="lock" size={14} /><span>{t('secure_connection')}</span></div>
    </Paper>
  </div>;
}
