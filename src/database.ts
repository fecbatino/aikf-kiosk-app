import Dexie, { Table } from 'dexie';

export interface Donation {
  id?: number;
  amount: number;
  qrCodeValue: string;
  timestamp: Date;
  category?: string; // Neue Spendenkategorie
  donorName?: string; // Name des Spenders
  donorEmail?: string; // E-Mail des Spenders
}

export class KioskDexie extends Dexie {
  donations!: Table<Donation>;

  constructor() {
    super('KioskDatabase');
    // Version 1: Ursprüngliche Struktur
    this.version(1).stores({
      donations: '++id, amount, qrCodeValue, timestamp',
    });
    // Version 2: Fügt die Kategorie hinzu
    this.version(2).stores({
      donations: '++id, amount, qrCodeValue, timestamp, category',
    }).upgrade(tx => {
      // Migrationslogik für bestehende Daten von Version 1 nach Version 2
      return tx.table('donations').toCollection().modify(donation => {
        if (!donation.category) {
          donation.category = 'Unkategorisiert';
        }
      });
    });
    // Version 3: Fügt Spenderdaten hinzu
    this.version(3).stores({
      donations: '++id, amount, qrCodeValue, timestamp, category, donorName, donorEmail',
    }).upgrade(tx => {
      // Migrationslogik für bestehende Daten von Version 2 nach Version 3
      return tx.table('donations').toCollection().modify(donation => {
        if (donation.donorName === undefined) {
          donation.donorName = '';
        }
        if (donation.donorEmail === undefined) {
          donation.donorEmail = '';
        }
      });
    });
  }
}

export const db = new KioskDexie();