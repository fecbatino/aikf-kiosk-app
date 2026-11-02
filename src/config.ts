export interface BankAccountConfig {
  bic: string;
  name: string;
  iban: string;
}

export interface AppConfig {
  sepa: BankAccountConfig;
  mosqueSepa: BankAccountConfig;
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
};

export default config;
