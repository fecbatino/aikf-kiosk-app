import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DonatePage from '../pages/DonatePage';
import { donationsApi, paymentsApi } from '../api';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'de' } }) }));
vi.mock('../config', () => ({ default: {
  sepa: { bic: 'SSKNDE77XXX', name: 'Afrikanischen Islamischen Kultur Franken', iban: 'DE79760501010005931811' },
  mosqueSepa: { bic: 'SSKNDE77XXX', name: 'Afrikanischen Islamischen Kultur Franken', iban: 'DE48760501010015938889' },
} }));
vi.mock('qrcode.react', () => ({ QRCodeSVG: ({ value, title }: { value: string; title: string }) => <svg role="img" aria-label={title} data-testid="transfer-qr" data-value={value} /> }));
vi.mock('../api', () => ({ donationsApi: { create: vi.fn() }, paymentsApi: { config: vi.fn(), checkout: vi.fn(), status: vi.fn(), cancel: vi.fn() } }));
beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); vi.mocked(paymentsApi.config).mockResolvedValue({ online: false, terminal: false, paired: false, testMode: false, methods: [] }); });
async function start() { await act(async () => { render(<MemoryRouter><DonatePage /></MemoryRouter>); }); }
async function reachPayment() { fireEvent.click(screen.getByRole('button', { name: '€20' })); fireEvent.click(screen.getByRole('button', { name: 'btn_next' })); fireEvent.click(screen.getByRole('button', { name: 'btn_next' })); }
describe('donation safety', () => {
  it('accepts German decimals and rejects excess precision or amounts above the limit', async () => {
    await start(); const field = screen.getByLabelText('enter_custom_amount');
    expect(screen.getByRole('button', { name: 'btn_next' })).toBeDisabled();
    fireEvent.change(field, { target: { value: '12,50' } }); expect(screen.getByRole('button', { name: 'btn_next' })).toBeEnabled();
    fireEvent.change(field, { target: { value: '12,501' } }); expect(screen.getByRole('button', { name: 'btn_next' })).toBeDisabled();
    fireEvent.change(field, { target: { value: '10001' } }); expect(screen.getByRole('button', { name: 'btn_next' })).toBeDisabled();
  });
  it('keeps unavailable card methods disabled and records anonymous transfers as pending', async () => {
    vi.mocked(donationsApi.create).mockResolvedValue({ id: '1', status: 'pending' });
    await start(); await reachPayment();
    expect(screen.getByRole('button', { name: /online_title/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /terminal_title/ })).toBeDisabled();
    const reference = screen.getByText(/^Spende Allgemein - AIKF-/).textContent!;
    fireEvent.click(screen.getByRole('button', { name: /payment_method_sepa/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'transfer_record' })); });
    expect(donationsApi.create).toHaveBeenCalledWith(expect.objectContaining({ donorName: 'Anonym', donorEmail: '', amount: 20, paymentMethod: 'sepa' }), expect.any(String));
    expect(reference.endsWith(vi.mocked(donationsApi.create).mock.calls[0][1].replace(/-/g, '').slice(0, 12).toUpperCase())).toBe(true);
    expect(screen.getByText('transfer_pending')).toBeInTheDocument(); expect(screen.queryByText('payment_confirmed')).not.toBeInTheDocument();
  });
  it('resets an in-progress donation when the header reset event fires', async () => {
    await start(); await reachPayment();
    await act(async () => { window.dispatchEvent(new Event('kiosk-reset')); });
    expect(screen.getByLabelText('enter_custom_amount')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'btn_next' })).toBeDisabled();
  });
  it('warns against paying twice if recording a bank transfer fails', async () => {
    vi.mocked(donationsApi.create).mockRejectedValue(new Error('network'));
    await start(); await reachPayment();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'transfer_record' })); });
    expect(screen.getByText('transfer_record_error')).toBeInTheDocument();
    expect(screen.queryByText('payment_confirmed')).not.toBeInTheDocument();
  });
  it('routes mosque purchase transfers to the dedicated account in both display and QR', async () => {
    await start();
    fireEvent.click(screen.getByRole('button', { name: '€20' }));
    fireEvent.click(screen.getByRole('button', { name: 'category_mosque_purchase' }));
    fireEvent.click(screen.getByRole('button', { name: 'btn_next' }));
    fireEvent.click(screen.getByRole('button', { name: 'btn_next' }));
    expect(screen.getByText('Afrikanischen Islamischen Kultur Franken')).toBeInTheDocument();
    expect(screen.getByText('DE48 7605 0101 0015 9388 89')).toBeInTheDocument();
    expect(screen.queryByText('DE79 7605 0101 0005 9318 11')).not.toBeInTheDocument();
    const fields = screen.getByTestId('transfer-qr').getAttribute('data-value')!.split('\n');
    expect(fields[5]).toBe('Afrikanischen Islamischen Kultur Franken');
    expect(fields[6]).toBe('DE48760501010015938889');
    expect(fields[10]).toMatch(/^Spende Moscheekauf - AIKF-[0-9A-F]{12}$/);
    expect(screen.getByText(fields[10])).toBeInTheDocument();
  });
  it('keeps Ramadan on the general account and capitalizes its transfer purpose', async () => {
    await start();
    fireEvent.click(screen.getByRole('button', { name: '€20' }));
    fireEvent.click(screen.getByRole('button', { name: 'category_ramadan' }));
    fireEvent.click(screen.getByRole('button', { name: 'btn_next' }));
    fireEvent.click(screen.getByRole('button', { name: 'btn_next' }));
    const fields = screen.getByTestId('transfer-qr').getAttribute('data-value')!.split('\n');
    expect(fields[5]).toBe('Afrikanischen Islamischen Kultur Franken');
    expect(fields[6]).toBe('DE79760501010005931811');
    expect(fields[10]).toMatch(/^Spende Ramadan - AIKF-/);
    expect(screen.getByText(fields[10])).toBeInTheDocument();
  });
});
