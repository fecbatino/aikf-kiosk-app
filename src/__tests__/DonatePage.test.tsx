import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DonatePage from '../pages/DonatePage';
import { SettingsProvider } from '../contexts/SettingsContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { changeLanguage: vi.fn(), language: 'de' },
  }),
}));

vi.mock('../database', () => ({
  db: {
    donations: { add: vi.fn().mockResolvedValue(1) },
  },
}));

describe('DonatePage', () => {
  it('renders step 1 (amount selection) on mount', () => {
    render(
      <BrowserRouter>
        <SettingsProvider>
          <DonatePage />
        </SettingsProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Spendenbetrag wählen')).toBeInTheDocument();
  });

  it('renders quick-amount buttons', () => {
    render(
      <BrowserRouter>
        <SettingsProvider>
          <DonatePage />
        </SettingsProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('€5')).toBeInTheDocument();
    expect(screen.getByText('€100')).toBeInTheDocument();
  });
});
