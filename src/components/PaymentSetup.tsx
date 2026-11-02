import { useEffect, useState } from 'react';
import { Alert, Button, Chip, Paper, Typography } from '@mui/material';
import { PaymentConfig, paymentsApi } from '../api';
export default function PaymentSetup({ token }: { token: string }) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { paymentsApi.config().then(setConfig).catch(() => setMessage('Zahlungsstatus derzeit nicht erreichbar.')); }, []);
  async function pair() {
    setBusy(true);
    try { const result = await paymentsApi.pair(token); localStorage.setItem('aikf-kiosk-pair', result.token); setConfig(await paymentsApi.config()); setMessage('Dieses Gerät ist für 30 Tage mit dem Terminal gekoppelt.'); }
    catch { setMessage('Kopplung nicht möglich. Terminal muss zuerst serverseitig eingerichtet werden.'); }
    finally { setBusy(false); }
  }
  return <Paper sx={{ p: { xs: 2.5, sm: 4 }, mt: 3, border: '1px solid', borderColor: 'divider', textAlign: 'start' }}>
    <Typography component="h2" variant="h5" gutterBottom>Zahlungen & Terminalberatung</Typography>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0' }}>
      <Chip label="SEPA-Überweisung: verfügbar" color="success" variant="outlined" />
      <Chip label={`Online-Checkout: ${config?.online ? 'freigeschaltet' : 'Einrichtung erforderlich'}`} color={config?.online ? 'success' : 'warning'} variant="outlined" />
      <Chip label={`Terminal: ${config?.terminal ? 'online' : 'noch nicht verfügbar'}`} variant="outlined" />
      {config?.testMode && <Chip label="Stripe-Testbetrieb" color="warning" />}
    </div>
    <Alert severity="info">Derzeit ist kein Terminal gekauft. Vor dem Kauf zuerst festlegen, ob vor Ort jederzeit jemand helfen kann. Für vollständig unbeaufsichtigten Betrieb ist ein dafür freigegebenes Automatenterminal erforderlich.</Alert>
    <Typography component="h3" variant="subtitle1" sx={{ mt: 3, fontWeight: 700 }}>Empfehlung für diese App</Typography>
    <Typography variant="body2" sx={{ my: 1, lineHeight: 1.8 }}>Bei Betreuung vor Ort: Stripe Reader S700. Die neue Version enthält die passende servergestützte Stripe-Anbindung. girocard, Debit- und Kreditkarten werden über das Terminal verarbeitet. Apple Pay und Google Pay funktionieren mit unterstützten Karten. Das Gerät muss zum deutschen Stripe-Händlerkonto gehören. WisePOS E unterstützt laut Stripe keine girocard und wird von dieser App deshalb nicht freigegeben.</Typography>
    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>Bei vollständig unbeaufsichtigtem Betrieb: zunächst ein Angebot für ein PAYONE-Automatenterminal einholen. Stripe nennt dafür das UX700; die öffentliche Länderliste enthält Deutschland derzeit nicht. Verfügbarkeit und girocard-Freigabe daher schriftlich bestätigen lassen. Eine PAYONE-Anbindung ist in dieser Version noch nicht enthalten.</Typography>
    <div style={{ overflowX: 'auto' }}><table className="provider-table"><caption>Öffentliche Anbieterangaben, geprüft am 01.11.2026</caption><thead><tr><th>Anbieter / Gerät</th><th>Anschaffung / Gebühren</th><th>Eignung / Integration</th></tr></thead><tbody>
      <tr><td><a href="https://stripe.com/de/terminal/s700" target="_blank" rel="noreferrer">Stripe S700</a></td><td>259 € laut Produktseite; Terminal: 1,4 % + 0,10 € für EWR-Karten, 2,9 % + 0,10 € für Nicht-EWR-Karten. Zubehör, Versand und steuerliche Behandlung im Angebot prüfen.</td><td>Betreut oder teilbetreut. Softwareanbindung vorbereitet; Konto, Webhook und Gerät müssen aktiviert werden.</td></tr>
      <tr><td><a href="https://help.sumup.com/de-DE/articles/5eKFr2wp9MhrmRPmvXl8lY-solo-uebersicht" target="_blank" rel="noreferrer">SumUp Solo</a></td><td>79 € zzgl. USt.; Standardtarif 1,39 % pro Terminalzahlung, 0 € monatlich.</td><td>Günstigere Alternative. Separate Cloud-API-Anbindung erforderlich; noch nicht implementiert. Kioskeinsatz und girocard mit PIN vor Kauf bestätigen lassen.</td></tr>
      <tr><td><a href="https://www.payone.com/DE-de/grosskunden/produkte/unattended" target="_blank" rel="noreferrer">PAYONE Automatenterminal</a></td><td>Individuelles Angebot für Gerät, Vertragslaufzeit, Grundpreis und Transaktionskosten.</td><td>Für unbeaufsichtigte Self-Service-Stationen konzipiert. Zusätzliche Integration und Abnahme erforderlich.</td></tr>
    </tbody></table></div>
    <Typography variant="body2" sx={{ my: 2 }}>Kostenbeispiel bei 20 € Spende: Stripe EWR-Standardtarif 0,38 €; SumUp Standardtarif 0,278 € vor Rundung. Hardware, Sonderkonditionen und weitere Vertragskosten separat vergleichen.</Typography>
    <Typography component="h3" variant="subtitle1" sx={{ mt: 3, fontWeight: 700 }}>Vor Freischaltung</Typography>
    <ol className="setup-list"><li>Händlerkonto auf AIKF e.V. verifizieren, Spendenzweck und Auszahlungskonto bestätigen.</li><li>Gültigen Stripe-Schlüssel und signierten Webhook auf dem Server einrichten. Zugangsdaten gehören nicht in den Chat oder Browser.</li><li>Checkout-Zahlungsarten freischalten: Karten und Link; optional PayPal, SEPA-Lastschrift und geeignete lokale Verfahren. Wallets hängen vom Endgerät und der hinterlegten Karte ab.</li><li>Terminal aus dem passenden Händlerkonto bestellen, Standort und Geräte-ID hinterlegen. Erst im Testbetrieb prüfen.</li><li>Am physischen Kiosk als Admin anmelden, Gerät koppeln, danach abmelden. Vor Livebetrieb girocard mit PIN, Kreditkarte, Abbruch, Doppelbedienung und Netzausfall prüfen.</li></ol>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Klarna ist in der Zahlungsartenliste nicht freigegeben: Stripe schließt gemeinnützige Organisationen für Klarna aus. Bargeld wird ohne vorhandene Annahmehardware nicht als automatisierte Zahlung angeboten.</Typography>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}><Button variant="outlined" disabled={busy || !config?.terminal} onClick={pair}>Dieses Kioskgerät koppeln</Button><Button onClick={() => { localStorage.removeItem('aikf-kiosk-pair'); setConfig(current => current ? { ...current, paired: false } : current); setMessage('Kopplung auf diesem Gerät entfernt.'); }}>Lokale Kopplung entfernen</Button></div>
    {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
    <Typography variant="body2" sx={{ mt: 3, lineHeight: 1.8 }}>Quellen: <a href="https://stripe.com/de/terminal" target="_blank" rel="noreferrer">Stripe Gebühren und Karten</a> · <a href="https://support.stripe.com/questions/using-terminal-in-attended-semi-attended-and-unattended-retail-environments?locale=en-GB" target="_blank" rel="noreferrer">Betriebsarten</a> · <a href="https://stripe.com/de/terminal/ux700" target="_blank" rel="noreferrer">UX700 Länder</a> · <a href="https://www.sumup.com/de-de/preise/" target="_blank" rel="noreferrer">SumUp Gebühren</a> · <a href="https://docs.stripe.com/payments/klarna/compliance" target="_blank" rel="noreferrer">Klarna-Regeln</a></Typography>
  </Paper>;
}
