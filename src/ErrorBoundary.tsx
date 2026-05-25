import { Component, ErrorInfo, ReactNode } from 'react';
import { Typography, Box, Button, Container } from '@mui/material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Hier könnten Fehler an einen externen Logging-Dienst gesendet werden
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Box sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Es ist ein Fehler aufgetreten.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Entschuldigung, etwas ist schiefgelaufen. Wir arbeiten daran, das Problem zu beheben.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => window.location.reload()} sx={{ mt: 3 }}>
              Seite neu laden
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
