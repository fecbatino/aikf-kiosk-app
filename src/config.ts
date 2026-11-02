// src/config.ts

interface AppConfig {
  sepa: {
    bic: string;
    name: string;
    iban: string;
  };
  mosqueSepa: {
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
    name: import.meta.env.VITE_SEPA_NAME || 'Afrikanischen Islamischen Kultur Franken',
    iban: import.meta.env.VITE_SEPA_IBAN || 'DEFAULTIBAN',
  },
  mosqueSepa: {
    bic: import.meta.env.VITE_MOSQUE_SEPA_BIC || '',
    name: import.meta.env.VITE_MOSQUE_SEPA_NAME || 'Afrikanischen Islamischen Kultur Franken',
    iban: import.meta.env.VITE_MOSQUE_SEPA_IBAN || '',
  },
  paymentLink: import.meta.env.VITE_PAYMENT_LINK || 'https://default.example.com/pay',
  adminPin: '',
};

export default config;
