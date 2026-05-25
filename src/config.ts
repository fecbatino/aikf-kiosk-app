// src/config.ts

interface AppConfig {
  sepa: {
    bic: string;
    name: string;
    iban: string;
  };
  paymentLink: string;
  adminPin: string; // Admin-PIN hinzugefügt
}

const config: AppConfig = {
  sepa: {
    bic: import.meta.env.VITE_SEPA_BIC || 'DEFAULTBIC',
    name: import.meta.env.VITE_SEPA_NAME || 'Default Org',
    iban: import.meta.env.VITE_SEPA_IBAN || 'DEFAULTIBAN',
  },
  paymentLink: import.meta.env.VITE_PAYMENT_LINK || 'https://default.example.com/pay',
  adminPin: import.meta.env.VITE_ADMIN_PIN || '0000', // Standard-PIN für Entwicklung/Fallback
};

export default config;
