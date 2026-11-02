import { donationReference, giroCode, parseAmount, validIban } from '../utils/payment';
describe('payment data', () => {
  it('parses cents exactly and enforces amount limits', () => {
    expect(parseAmount('12,50')).toBe(12.5); expect(parseAmount('10000')).toBe(10000);
    for (const value of ['0', '-1', '1e3', 'Infinity', '1.001', '10001', '5abc']) expect(parseAmount(value)).toBeNull();
  });
  it('uses readable, correctly capitalized purposes and stable short references', () => {
    const id = 'ffd3d262-7728-4e0e-9dd5-825335bda5d7';
    expect(donationReference('general', id)).toBe('Spende Allgemein - AIKF-FFD3D2627728');
    expect(donationReference('ramadan', id)).toBe('Spende Ramadan - AIKF-FFD3D2627728');
    expect(donationReference('education', id)).toBe('Spende Bildung - AIKF-FFD3D2627728');
    expect(donationReference('mosque_purchase', id)).toBe('Spende Moscheekauf - AIKF-FFD3D2627728');
  });
  it('encodes the mosque purchase beneficiary and dedicated account in the GiroCode', () => {
    const bank = { bic: 'SSKNDE77XXX', name: 'Afrikanischen Islamischen Kultur Franken', iban: 'DE48760501010015938889' };
    expect(validIban(bank.iban)).toBe(true);
    const reference = donationReference('mosque_purchase', 'ffd3d262-7728-4e0e-9dd5-825335bda5d7');
    const fields = giroCode(bank, 20, reference).split('\n');
    expect(fields[5]).toBe(bank.name); expect(fields[6]).toBe(bank.iban);
    expect(fields[8]).toBe(''); expect(fields[9]).toBe('');
    expect(fields[7]).toBe('EUR20.00'); expect(fields[10]).toBe(reference);
  });
  it('validates bank checksum and generates a standards-based transfer payload', () => {
    const bank = { bic: 'SSKNDE77XXX', name: 'AIKF e.V.', iban: 'DE79760501010005931811' };
    expect(validIban(bank.iban)).toBe(true); expect(validIban('DE79760501010005931812')).toBe(false);
    expect(giroCode(bank, 12.5, 'Spende AIKF')).toBe('BCD\n002\n1\nSCT\nSSKNDE77XXX\nAIKF e.V.\nDE79760501010005931811\nEUR12.50\n\n\nSpende AIKF');
  });
});
