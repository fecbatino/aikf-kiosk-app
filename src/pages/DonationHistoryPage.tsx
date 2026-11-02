import { useState, useEffect, useCallback } from 'react';

import {

  Alert, TextField, Typography, Box, Container, Paper, Table, TableHead, TableRow,

  TableCell, TableBody, Button, FormControl, InputLabel, Select,

  MenuItem, Chip, Pagination, Dialog, DialogTitle, DialogContent,

  DialogContentText, DialogActions, SelectChangeEvent

} from '@mui/material';

import { useTranslation } from 'react-i18next';

import { useAuth } from '../contexts/AuthContext';

import { donationsApi, Donation } from '../api';

import { useNavigate } from 'react-router-dom';



const CATEGORIES = [

  { value: 'all', labelKey: 'category_all' },

  { value: 'general', labelKey: 'category_general' },

  { value: 'education', labelKey: 'category_education' },

  { value: 'mosque_purchase', labelKey: 'category_mosque_purchase' },

  { value: 'ramadan', labelKey: 'category_ramadan' },

];



const STATUS_COLORS: Record<string, string> = {

  completed: '#10b981',

  pending: '#f59e0b',

  failed: '#ef4444',

};



function DonationHistoryPage() {

  const { t } = useTranslation();

  const { isAuthenticated, getToken } = useAuth();

  const navigate = useNavigate();



  const [donations, setDonations] = useState<Donation[]>([]);

  const [_total, _setTotal] = useState(0);

  

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [filterCategory, setFilterCategory] = useState('all');

  const [sortBy, setSortBy] = useState('date_desc');

  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);



  const [error, setError] = useState('');

  const [reconcileId, setReconcileId] = useState<string | null>(null);

  const [bankReference, setBankReference] = useState('');

  const limit = 20;



  const loadDonations = useCallback(async () => {

    const token = getToken();

    if (!token) return;

    setLoading(true);

    try {

      const params: any = { page, limit, sort: sortBy };

      if (filterCategory !== 'all') params.category = filterCategory;

      const res = await donationsApi.list(params, token);

      setDonations(res.data);

      _setTotal(res.pagination.total);

      setTotalPages(res.pagination.totalPages);

    } catch (err: any) {

      setError('Spenden konnten nicht geladen werden.');

    } finally {

      setLoading(false);

    }

  }, [page, filterCategory, sortBy, getToken]);



  useEffect(() => {

    if (isAuthenticated) loadDonations();

  }, [isAuthenticated, loadDonations]);



  const handleFilterChange = (e: SelectChangeEvent) => {

    setFilterCategory(e.target.value);

    setPage(1);

  };



  const handleSortChange = (e: SelectChangeEvent) => {

    setSortBy(e.target.value);

    setPage(1);

  };



  const handlePageChange = (_: any, value: number) => {

    setPage(value);

  };



  const handleExport = async () => {

    const token = getToken();

    if (!token) return;

    try {

      const rows: Donation[] = [];

      let exportPage = 1;

      let pages = 1;

      do {

        const result = await donationsApi.list({ limit: 100, page: exportPage, category: filterCategory === 'all' ? undefined : filterCategory, sort: sortBy }, token);

        rows.push(...result.data); pages = result.pagination.totalPages; exportPage++;

      } while (exportPage <= pages);

      const cell = (value: unknown) => {

        let text = String(value ?? '');

        if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;

        return '"' + text.replace(/"/g, '""') + '"';

      };

      const csv = '\ufeff' + [

        ['ID', 'Datum', 'Betrag EUR', 'Kategorie', 'Spender', 'E-Mail', 'Status'].map(cell).join(';'),

        ...rows.map(d => [d.id, new Date(d.createdAt).toISOString(), d.amount.toFixed(2), d.category, d.donorName, d.donorEmail, d.status].map(cell).join(';')),

      ].join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv' });

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'donations.csv';

      a.click();

      URL.revokeObjectURL(url);

    } catch (err: any) {

      setError('Export fehlgeschlagen. Bitte erneut versuchen.');

    }

  };



  const handleDeleteClick = (id: string) => {

    setDeleteTarget(id);

    setDeleteDialogOpen(true);

  };



  const handleDeleteCancel = () => {

    setDeleteDialogOpen(false);

    setDeleteTarget(null);

  };



  const handleDeleteConfirm = async () => {

    if (!deleteTarget) return;

    const token = getToken();

    if (!token) return;

    setDeleting(true);

    try {

      await donationsApi.delete(deleteTarget, token);

      setDeleteDialogOpen(false);

      setDeleteTarget(null);

      loadDonations();

    } catch (err: any) {

      setError('Bestätigte Spenden bleiben für den Nachweis erhalten. Löschung fehlgeschlagen.');

    } finally {

      setDeleting(false);

    }

  };



  const handleReceipt = async (id: string) => {

    const token = getToken(); if (!token) return;

    try { await donationsApi.receipt(id, token); } catch { setError('Beleg konnte nicht geladen werden.'); }

  };



  const sortedDonations = donations;



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

            Bitte melde dich als Administrator an.

          </Typography>

          <Button variant="contained" color="primary" onClick={() => navigate('/admin')} fullWidth sx={{ height: '48px', borderRadius: '24px' }}>

            Zum Admin-Login

          </Button>

        </Paper>

      </Container>

    );

  }



  return (

    <Container maxWidth="lg">

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Dialog open={!!reconcileId} onClose={() => !deleting && setReconcileId(null)}>

        <DialogTitle>Bankeingang bestätigen</DialogTitle>

        <DialogContent><DialogContentText>Nur nach Prüfung des Kontoauszugs bestätigen. Betrag, Empfänger und Verwendungszweck müssen übereinstimmen. Die Freigabe wird mit Ihrer Admin-ID und dem Zeitpunkt gespeichert.</DialogContentText><TextField label="Referenz im Kontoauszug" fullWidth value={bankReference} onChange={e => setBankReference(e.target.value)} sx={{ mt: 3 }} slotProps={{ htmlInput: { maxLength: 140 } }} /></DialogContent>

        <DialogActions><Button disabled={deleting} onClick={() => setReconcileId(null)}>Abbrechen</Button><Button variant="contained" disabled={deleting || bankReference.trim().length < 3} onClick={async () => {

          const token = getToken(); if (!token || !reconcileId) return;

          setDeleting(true); try { await donationsApi.reconcile(reconcileId, bankReference, token); setReconcileId(null); setBankReference(''); await loadDonations(); } catch { setError('Bankeingang konnte nicht bestätigt werden.'); } finally { setDeleting(false); }

        }}>Geprüften Eingang bestätigen</Button></DialogActions>

      </Dialog>

      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 800, mb: 4 }}>

        {t('donation_history_title')}

      </Typography>



      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

            <FormControl size="small" sx={{ minWidth: 150 }}>

              <InputLabel>{t('filter_by_category')}</InputLabel>

              <Select value={filterCategory} label={t('filter_by_category')} onChange={handleFilterChange}>

                {CATEGORIES.map((c) => (

                  <MenuItem key={c.value} value={c.value}>{t(c.labelKey)}</MenuItem>

                ))}

              </Select>

            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>

              <InputLabel>{t('sort_by')}</InputLabel>

              <Select value={sortBy} label={t('sort_by')} onChange={handleSortChange}>

                <MenuItem value="date_desc">{t('sort_date_desc')}</MenuItem>

                <MenuItem value="date_asc">{t('sort_date_asc')}</MenuItem>

                <MenuItem value="amount_desc">{t('sort_amount_desc')}</MenuItem>

                <MenuItem value="amount_asc">{t('sort_amount_asc')}</MenuItem>

              </Select>

            </FormControl>

          </Box>

          <Button variant="contained" color="primary" onClick={handleExport} sx={{ borderRadius: '12px' }}>

            CSV Export

          </Button>

        </Box>

      </Paper>



      {loading ? (

        <Typography align="center" sx={{ py: 4 }}>Lade...</Typography>

      ) : sortedDonations.length === 0 ? (

        <Typography align="center" sx={{ py: 4, color: 'text.secondary' }}>

          {t('no_donations_yet')}

        </Typography>

      ) : (

        <>

          <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'background.paper', overflowX: 'auto' }}>

            <Table>

              <TableHead>

                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>

                  <TableCell sx={{ fontWeight: 700 }}>Datum</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Betrag</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Kategorie</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Spender</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Aktionen</TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {sortedDonations.map((d) => (

                  <TableRow key={d.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>

                    <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>{d.amount.toFixed(2)} EUR</TableCell>

                    <TableCell>

                      <Chip

                        label={t('category_' + d.category, d.category)}

                        size="small"

                        sx={{ borderRadius: '8px', fontWeight: 600 }}

                      />

                    </TableCell>

                    <TableCell>

                      <Typography variant="body2">{d.donorName || 'Anonym'}</Typography>
                      <Typography variant="caption" component="div" sx={{ overflowWrap: 'anywhere', minWidth: 160 }}>ID: {d.id}</Typography>

                      {d.donorEmail && (

                        <Typography variant="caption" color="text.secondary">{d.donorEmail}</Typography>

                      )}

                    </TableCell>

                    <TableCell>

                      <Chip

                        label={d.status}

                        size="small"

                        sx={{

                          borderRadius: '8px',

                          fontWeight: 600,

                          bgcolor: (STATUS_COLORS[d.status] || '#6b7280') + '22',

                          color: STATUS_COLORS[d.status] || '#6b7280',

                        }}

                      />

                    </TableCell>

                    <TableCell>

                      <Box sx={{ display: 'flex', gap: 1 }}>

                        {d.paymentMethod === 'sepa' && d.status === 'pending' && <Button onClick={() => { setReconcileId(d.id); setBankReference(''); }}>Abgleichen</Button>}

                        <Button size="small" variant="outlined" disabled={d.status !== "completed"} onClick={() => void handleReceipt(d.id)} sx={{ borderRadius: '8px', minWidth: '36px', px: 1 }}>

                          PDF

                        </Button>

                        <Button size="small" variant="outlined" color="error" disabled={d.status === "completed"} onClick={() => handleDeleteClick(d.id)} sx={{ borderRadius: '8px', minWidth: '36px', px: 1 }}>

                          X

                        </Button>

                      </Box>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </Paper>



          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>

            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />

          </Box>

        </>

      )}



      <Dialog

        open={deleteDialogOpen}

        onClose={handleDeleteCancel}

        slotProps={{

          paper: {

            sx: {

              borderRadius: 3,

              background: 'rgba(21, 28, 44, 0.95)',

              backdropFilter: 'blur(16px)',

              border: '1px solid rgba(255, 255, 255, 0.1)',

            },

          },

        }}

      >

        <DialogTitle sx={{ fontWeight: 700 }}>Spende loeschen</DialogTitle>

        <DialogContent>

          <DialogContentText>Bist du sicher? Diese Aktion kann nicht rueckgaengig gemacht werden.</DialogContentText>

        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>

          <Button onClick={handleDeleteCancel} disabled={deleting} sx={{ borderRadius: '10px' }}>Abbrechen</Button>

          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting} sx={{ borderRadius: '10px' }}>

            {deleting ? 'Loesche...' : 'Loeschen'}

          </Button>

        </DialogActions>

      </Dialog>

    </Container>

  );

}



export default DonationHistoryPage;

