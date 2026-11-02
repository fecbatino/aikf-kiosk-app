import { Container, Paper, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import BackToHome from "../components/BackToHome";

function ImprintPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackToHome />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", textAlign: "left" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            {t("footer_imprint")}
          </Typography>
          <Box sx={{ "& p": { mb: 2, lineHeight: 1.8 } }}>
            <Typography variant="body1" component="p">
              <strong>AIKF e.V. Nürnberg</strong><br />
              Al Rahama Moschee<br />
              Wölckernstraße 78<br />
              90459 Nürnberg<br />
              Deutschland
            </Typography>
            <Typography variant="body1" component="p">
              <strong>Vertreten durch:</strong><br />
              Vorstand: Baba Issaka Saana (1. Vorsitzender)
            </Typography>
            <Typography variant="body1" component="p">
              <strong>Kontakt:</strong><br />
              E-Mail: naikf2006@gmail.com
            </Typography>
            <Typography variant="body1" component="p">
              <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
              Fechal Batakpale<br />
              Wölckernstraße 78, 90459 Nürnberg
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default ImprintPage;