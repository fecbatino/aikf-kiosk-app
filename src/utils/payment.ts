export function parseAmount(value: string): number | null {
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(value)) return null;
  const amount = Number(value.replace(',', '.'));
  return amount >= 1 && amount <= 10000 ? amount : null;
}

export function validIban(iban: string): boolean {
  const value = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value)) return false;
  const digits = (value.slice(4) + value.slice(0, 4)).replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}

export function giroCode(bank: { bic: string; name: string; iban: string }, amount: number, reference: string): string {
  return ['BCD', '002', '1', 'SCT', bank.bic.replace(/\s/g, ''), bank.name.slice(0, 70), bank.iban.replace(/\s/g, ''),
    `EUR${amount.toFixed(2)}`, '', '', reference.replace(/[\r\n]/g, ' ').slice(0, 140)].join('\n');
}

const bankCategoryNames: Record<string, string> = {
  general: 'Allgemein', education: 'Bildung', mosque_purchase: 'Moscheekauf', ramadan: 'Ramadan',
};

// A German payment purpose remains stable when the kiosk language changes.
// The short, case-insensitive ID prefix links the bank statement to the full record.
export function donationReference(category: string, donationId: string): string {
  const reference = donationId.replace(/-/g, '').slice(0, 12).toUpperCase();
  return `Spende ${bankCategoryNames[category] || 'Allgemein'} - AIKF-${reference}`;
}

export interface PaymentAttempt { donationId: string; token: string; method: 'online' | 'terminal'; url?: string; amount?: number; category?: string }
export function restoredAttempt(): PaymentAttempt | null {
  try {
    const query = new URLSearchParams(window.location.hash.split('?')[1]);
    if (query.get('id') && query.get('token')) return { donationId: query.get('id')!, token: query.get('token')!, method: 'online' };
    return JSON.parse(sessionStorage.getItem('aikf-payment') || 'null');
  } catch { return null; }
}
