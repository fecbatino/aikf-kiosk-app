import { TFunction } from 'i18next';
import { Donation } from '../database';

export function exportDonationsCsv(donations: Donation[], t: TFunction, filename?: string): void {
  const csvHeader = [
    t('donation_id', 'Spenden-ID'),
    t('donation_amount', 'Betrag (€)'),
    t('donation_category', 'Kategorie'),
    t('donor_name', 'Spender-Name'),
    t('donor_email', 'Spender-E-Mail'),
    t('donation_timestamp', 'Zeitstempel'),
  ].join(',');

  const csvRows = donations.map((donation) => {
    const category = t(`category_${donation.category || 'Unkategorisiert'}`);
    const timestamp = new Date(donation.timestamp).toLocaleString();
    const donorName = donation.donorName || 'Anonym';
    const donorEmail = donation.donorEmail || '';
    return `"${donation.id}","${donation.amount}","${category}","${donorName}","${donorEmail}","${timestamp}"`;
  });

  const csvContent = [csvHeader, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const downloadName = filename ?? `spenden_historie_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', downloadName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
