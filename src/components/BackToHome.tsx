import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
export default function BackToHome() {
  const { t } = useTranslation();
  return <Button component={Link} to="/" startIcon={<Icon name="back" size={18} />} sx={{ mb: 2, px: 0, color: 'text.secondary', '&:hover': { background: 'transparent', color: 'primary.main' } }}>{t('btn_back')}</Button>;
}
