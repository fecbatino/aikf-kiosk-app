import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DonatePage from '../pages/DonatePage';
import { donationsApi, paymentsApi } from '../api';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'de', changeLanguage: vi.fn() } }) }));
vi.mock('../config', () => ({ default: {
  sepa: { bic: 'SSKNDE77XXX', name: 'Afrikanischen Islamischen Kultur Franken', iban: 'DE79760501010005931811' },
  mosqueSepa: { bic: 'SSKNDE77XXX', name: 'Afrikanischen Islamischen Kultur Franken', iban: 'DE48760501010015938889' },
} }));
vi.mock('qrcode.react', () => ({ QRCodeSVG: ({ value, title }: { value: string; title: string }) => <svg role="img" aria-label={title} data-testid="transfer-qr" data-value={value} /> }));
vi.mock('../api', () => ({ donationsApi: { create: vi.fn() }, paymentsApi: { config: vi.fn(), prepare: vi.fn(), recover: vi.fn(), checkout: vi.fn(), terminal: vi.fn(), status: vi.fn(), cancel: vi.fn() } }));
beforeEach(() => {
 sessionStorage.clear(); vi.resetAllMocks();
 vi.mocked(paymentsApi.config).mockResolvedValue({ online: false, terminal: false, paired: false, testMode: false, methods: [] });
 vi.mocked(donationsApi.create).mockImplementation(async (_input,key) => ({ id:key,status:'pending' }));
});
async function start() { await act(async () => { render(<MemoryRouter><DonatePage /></MemoryRouter>); }); }
async function reachPayment(category?: string) {
 fireEvent.click(screen.getByRole('button', { name: '€20' }));
 if(category) fireEvent.click(screen.getByRole('button',{name:'category_'+category}));
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'btn_next'}));});
}
describe('donation safety and kiosk usability', () => {
 it('accepts German decimals and rejects excess precision or amounts above the limit', async () => {
  await start(); const field=screen.getByLabelText('enter_custom_amount');
  expect(screen.getByRole('button',{name:'btn_next'})).toBeDisabled();
  fireEvent.change(field,{target:{value:'12,50'}});expect(screen.getByRole('button',{name:'btn_next'})).toBeEnabled();
  fireEvent.change(field,{target:{value:'12,501'}});expect(screen.getByRole('button',{name:'btn_next'})).toBeDisabled();
  fireEvent.change(field,{target:{value:'10001'}});expect(screen.getByRole('button',{name:'btn_next'})).toBeDisabled();
 });
 it('saves the SEPA intention before displaying a usable QR code',async()=>{
  let resolve!: (value:{id:string;status:string})=>void;
  vi.mocked(donationsApi.create).mockImplementation((_input,key)=>new Promise(r=>{resolve=()=>r({id:key,status:'pending'});}));
  await start();await reachPayment();
  expect(screen.queryByTestId('transfer-qr')).not.toBeInTheDocument();expect(screen.getByText('bank_preparing')).toBeInTheDocument();
  await act(async()=>{resolve({id:'unused',status:'pending'});});
  expect(screen.getByTestId('transfer-qr')).toBeInTheDocument();
  expect(donationsApi.create).toHaveBeenCalledWith(expect.objectContaining({paymentMethod:'sepa',donorName:'Anonym'}),expect.any(String));
 });
 it('shows a retry instead of a payable QR when preparing the bank record fails',async()=>{
  vi.mocked(donationsApi.create).mockRejectedValueOnce(new Error('network'));
  await start();await reachPayment();
  expect(screen.getByText('bank_prepare_error')).toBeInTheDocument();expect(screen.queryByTestId('transfer-qr')).not.toBeInTheDocument();
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'retry'}));});
  expect(screen.getByTestId('transfer-qr')).toBeInTheDocument();
  expect(vi.mocked(donationsApi.create).mock.calls[0][1]).toBe(vi.mocked(donationsApi.create).mock.calls[1][1]);
 });
 it('uses two steps for anonymous donations and keeps disabled methods out of the main choices',async()=>{
  await start();await reachPayment();
  expect(screen.getByRole('heading',{name:'select_payment_method'})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/online_title/})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:/terminal_title/})).not.toBeInTheDocument();
  expect(screen.getByText('payments_setup_note')).toBeInTheDocument();
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'transfer_record'}));});
  expect(screen.getByText('transfer_pending')).toBeInTheDocument();expect(screen.queryByText('payment_confirmed')).not.toBeInTheDocument();expect(donationsApi.create).toHaveBeenCalledTimes(1);
 });
 it('retains a pending bank intention when the visitor resets the screen',async()=>{
  await start();await reachPayment();
  const original=vi.mocked(donationsApi.create).mock.calls[0][1];
  await act(async()=>{window.dispatchEvent(new Event('kiosk-reset'));});
  expect(screen.getByLabelText('enter_custom_amount')).toHaveValue('');expect(donationsApi.create).toHaveBeenCalledTimes(1);
  await reachPayment();expect(vi.mocked(donationsApi.create).mock.calls[1][1]).not.toBe(original);
 });
 it.each([['mosque_purchase','DE48760501010015938889','Spende Moscheekauf'],['ramadan','DE79760501010005931811','Spende Ramadan']])('routes %s to its exact beneficiary account and purpose',async(category,iban,purpose)=>{
  await start();await reachPayment(category);
  const fields=screen.getByTestId('transfer-qr').getAttribute('data-value')!.split('\n');
  expect(fields[5]).toBe('Afrikanischen Islamischen Kultur Franken');expect(fields[6]).toBe(iban);expect(fields[9]).toBe('');expect(fields[10]).toMatch(new RegExp('^'+purpose+' - AIKF-'));
  expect(screen.getByText(fields[10])).toBeInTheDocument();
 });
 it('copies IBAN and reference using separate labeled actions',async()=>{
  const writeText=vi.fn().mockResolvedValue(undefined);Object.defineProperty(navigator,'clipboard',{value:{writeText},configurable:true});
  await start();await reachPayment();
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'bank_copy_iban'}));});
  expect(writeText).toHaveBeenCalledWith('DE79760501010005931811');expect(screen.getByRole('status')).toHaveTextContent('bank_copied');
 });
 it('stores the recoverable terminal attempt before starting the reader, even when its response is lost',async()=>{
  vi.mocked(paymentsApi.config).mockResolvedValue({online:true,terminal:true,paired:true,testMode:true,methods:['card']});
  vi.mocked(paymentsApi.prepare).mockImplementation(async(_input,key)=>({donationId:key,token:'saved-token'}));
  vi.mocked(paymentsApi.status).mockResolvedValue({status:'pending',amount:20,category:'general'});
  vi.mocked(paymentsApi.terminal).mockImplementation(async()=>{expect(sessionStorage.getItem('aikf-payment')).toContain('saved-token');throw new Error('lost response');});
  vi.mocked(paymentsApi.cancel).mockResolvedValue({status:'cancelled'});
  await start();await reachPayment();fireEvent.click(screen.getByRole('button',{name:/terminal_title/}));
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'start_terminal'}));});
  expect(sessionStorage.getItem('aikf-payment')).toContain('saved-token');expect(screen.queryByRole('button',{name:/online_title/})).not.toBeInTheDocument();
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'cancel_payment'}));});
  expect(paymentsApi.cancel).toHaveBeenCalledWith(expect.any(String),'saved-token');expect(sessionStorage.getItem('aikf-payment')).toBeNull();
 });
 it('recovers an expired status token and permits verified cancellation',async()=>{
  sessionStorage.setItem('aikf-payment',JSON.stringify({donationId:'stored',token:'expired',method:'online',amount:20,category:'general'}));
  vi.mocked(paymentsApi.status).mockRejectedValueOnce(new Error('INVALID_PAYMENT_TOKEN')).mockResolvedValue({status:'pending',amount:20,category:'general'});
  vi.mocked(paymentsApi.recover).mockResolvedValue({donationId:'stored',token:'renewed'});
  vi.mocked(paymentsApi.cancel).mockResolvedValue({status:'cancelled'});
  await start();await waitFor(()=>expect(sessionStorage.getItem('aikf-payment')).toContain('renewed'));
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'cancel_payment'}));});
  expect(paymentsApi.cancel).toHaveBeenCalledWith('stored','renewed');expect(screen.getByLabelText('enter_custom_amount')).toHaveValue('');
 });

 it('reuses the prepared SEPA record when toggling between payment methods on step 2',async()=>{
  vi.mocked(paymentsApi.config).mockResolvedValue({online:true,terminal:false,paired:false,testMode:false,methods:['card']});
  await start();await reachPayment();
  expect(donationsApi.create).toHaveBeenCalledTimes(1);
  const firstRef=screen.getByText(/^Spende Allgemein - AIKF-/).textContent;
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:/online_title/}));});
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:/payment_method_sepa/}));});
  expect(donationsApi.create).toHaveBeenCalledTimes(1);
  expect(screen.getByText(firstRef!)).toBeInTheDocument();
 });
});
