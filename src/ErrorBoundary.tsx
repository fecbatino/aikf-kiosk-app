import { Component, ErrorInfo, ReactNode } from 'react';
import { Typography, Box, Button, Container } from '@mui/material';
import i18n from './i18n';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Box sx={{ p: 4, bgcolor: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {i18n.t('error_boundary_title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {i18n.t('error_boundary_description')}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => window.location.reload()} sx={{ mt: 3 }}>
              {i18n.t('error_boundary_reload')}
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
