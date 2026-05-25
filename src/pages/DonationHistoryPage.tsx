import { useEffect, useState, useMemo } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Container, FormControl, InputLabel, Select, MenuItem, Button, SelectChangeEvent, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { db, Donation } from '../database';
import { exportDonationsCsv } from '../utils/exportCsv';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const donationCategories = [
  { value: 'all', labelKey: 'category_all' }, // Neue Option für alle Kategorien
  { value: 'general', labelKey: 'category_general' },
  { value: 'education', labelKey: 'category_education' },
  { value: 'health', labelKey: 'category_health' },
  { value: 'food', labelKey: 'category_food' },
  { value: 'Unkategorisiert', labelKey: 'category_Unkategorisiert' },
];

function DonationHistoryPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc'); // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc'

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadDonations = async () => {
      const donations = await db.donations.toArray();
      setAllDonations(donations);
    };
    loadDonations();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 8 } }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Box sx={{ opacity: 0.2, mb: 2, display: 'flex', justifyContent: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
            Zugriff verweigert
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Diese Seite ist geschützt. Bitte melde dich als Administrator an, um die Spendenhistorie einzusehen.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin')}
            fullWidth
            sx={{ height: '48px', borderRadius: '24px' }}
          >
            Zum Admin-Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const filteredAndSortedDonations = useMemo(() => {
    let filtered = allDonations;
    if (filterCategory !== 'all') {
      filtered = filtered.filter(donation => (donation.category || 'Unkategorisiert') === filterCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      } else if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
    return sorted;
  }, [allDonations, filterCategory, sortBy]);

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterCategory(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleExport = () => {
    exportDonationsCsv(filteredAndSortedDonations, t, 'donations_history.csv');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('donation_history_title')}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
        <Button variant="contained" onClick={handleExport}>
          {t('export_donations')}
        </Button>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="filter-category-label">{t('filter_by_category')}</InputLabel>
          <Select
            labelId="filter-category-label"
            id="filter-category-select"
            value={filterCategory}
            label={t('filter_by_category')}
            onChange={handleFilterChange}
          >
            {donationCategories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {t(category.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-by-label">{t('sort_by')}</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by-select"
            value={sortBy}
            label={t('sort_by')}
            onChange={handleSortChange}
          >
            <MenuItem value="date_desc">{t('sort_date_desc')}</MenuItem>
            <MenuItem value="date_asc">{t('sort_date_asc')}</MenuItem>
            <MenuItem value="amount_desc">{t('sort_amount_desc')}</MenuItem>
            <MenuItem value="amount_asc">{t('sort_amount_asc')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredAndSortedDonations.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          {t('no_donations_yet')}
        </Typography>
      ) : (
        <List sx={{ mt: 4 }}>
          {filteredAndSortedDonations.map((donation) => (
            <ListItem key={donation.id} divider>
              <ListItemText
                primary={`${t('donation_amount')} €${donation.amount} - ${t('donation_category')}: ${t(`category_${donation.category || 'Unkategorisiert'}`)}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                      Spender: {donation.donorName || 'Anonym'} {donation.donorEmail ? `(${donation.donorEmail})` : ''}
                    </Typography>

                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {t('timestamp')}: {new Date(donation.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}

export default DonationHistoryPage;
