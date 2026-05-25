import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

export interface KioskSettings {
  sepaBic: string;
  sepaName: string;
  sepaIban: string;
  paymentLink: string;
  adminPin: string;
}

interface SettingsContextType {
  settings: KioskSettings;
  updateSettings: (newSettings: Partial<KioskSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<KioskSettings>({
    sepaBic: config.sepa.bic,
    sepaName: config.sepa.name,
    sepaIban: config.sepa.iban,
    paymentLink: config.paymentLink,
    adminPin: config.adminPin,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const sepaBic = localStorage.getItem('aikf_sepa_bic') || config.sepa.bic;
    const sepaName = localStorage.getItem('aikf_sepa_name') || config.sepa.name;
    const sepaIban = localStorage.getItem('aikf_sepa_iban') || config.sepa.iban;
    const paymentLink = localStorage.getItem('aikf_payment_link') || config.paymentLink;
    const adminPin = localStorage.getItem('aikf_admin_pin') || config.adminPin;

    setSettings({
      sepaBic,
      sepaName,
      sepaIban,
      paymentLink,
      adminPin,
    });
  }, []);

  const updateSettings = (newSettings: Partial<KioskSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      
      if (newSettings.sepaBic !== undefined) localStorage.setItem('aikf_sepa_bic', newSettings.sepaBic);
      if (newSettings.sepaName !== undefined) localStorage.setItem('aikf_sepa_name', newSettings.sepaName);
      if (newSettings.sepaIban !== undefined) localStorage.setItem('aikf_sepa_iban', newSettings.sepaIban);
      if (newSettings.paymentLink !== undefined) localStorage.setItem('aikf_payment_link', newSettings.paymentLink);
      if (newSettings.adminPin !== undefined) localStorage.setItem('aikf_admin_pin', newSettings.adminPin);

      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
