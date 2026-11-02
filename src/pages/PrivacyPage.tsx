import { Container, Paper, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import BackToHome from "../components/BackToHome";

function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <>
      <BackToHome />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper", textAlign: "left" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            {t("footer_privacy")}
          </Typography>
          <Box sx={{ "& p": { mb: 2, lineHeight: 1.8 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>1. Datenschutz auf einen Blick</Typography>
            <Typography variant="body1" component="p">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diesen Spendenkiosk nutzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>2. Datenerfassung auf dieser Website</Typography>
            <Typography variant="body1" component="p">
              <strong>Wer ist verantwortlich für die Datenerfassung?</strong><br />
              Die Datenverarbeitung erfolgt durch den Betreiber des Kiosks: AIKF e.V. Nürnberg, Al Rahama Moschee, Wölckernstraße 78, 90459 Nürnberg, E-Mail: naikf2006@gmail.com.
            </Typography>
            <Typography variant="body1" component="p">
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen – z.B. durch Eingabe im Spendenformular (Name, E-Mail-Adresse). Andere Daten werden automatisch beim Besuch des Kiosks durch unsere IT-Systeme erfasst (z.B. technische Daten wie Browsertyp, Uhrzeit des Zugriffs).
            </Typography>
            <Typography variant="body1" component="p">
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Die von Ihnen eingegebenen Daten werden ausschließlich zur Abwicklung Ihrer Spende und zur Ausstellung einer Spendenquittung verwendet. Bei Online- und Terminalzahlungen erhält der Zahlungsdienstleister Stripe die zur Zahlungsabwicklung erforderlichen Angaben. Bei einer Banküberweisung verarbeitet Ihre Bank die Überweisungsdaten. Die App speichert keine vollständigen Kartennummern oder PINs.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>3. Ihre Rechte</Typography>
            <Typography variant="body1" component="p">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben außerdem das Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter naikf2006@gmail.com an uns wenden.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>4. Speicherdauer</Typography>
            <Typography variant="body1" component="p">
              Spendenbezogene Daten werden gemäß den gesetzlichen Aufbewahrungsfristen (10 Jahre für steuerrelevante Unterlagen) gespeichert. Bei anonymen Spenden erfasst das Kioskformular keine Kontaktangaben. Banken und Zahlungsdienstleister verarbeiten die für die Zahlung erforderlichen Daten unabhängig davon.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>5. SSL- bzw. TLS-Verschlüsselung</Typography>
            <Typography variant="body1" component="p">
              Dieser Kiosk nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers mit „https://" beginnt.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default PrivacyPage;