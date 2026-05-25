# AIKF Spendenkiosk

## Projektbeschreibung
Die AIKF Spendenkiosk-App ist eine Progressive Web App (PWA), die entwickelt wurde, um Spendern eine einfache Möglichkeit zu bieten, für verschiedene Kategorien zu spenden. Sie ermöglicht die Auswahl von Beträgen, das Scannen von QR-Codes für Zahlungsmethoden und bietet eine Admin-Oberfläche zur Verwaltung und zum Export der Spendenhistorie.

## Features

- **Spendenfunktion:** Einfache Auswahl von Spendenbeträgen und Kategorien.
- **QR-Code-Generierung:** Dynamische Generierung von QR-Codes für SEPA-Überweisungen und Zahlungslinks.
- **Mehrsprachigkeit (i18n):** Unterstützung für Deutsch, Englisch und Französisch.
- **Spendenhistorie:** Ansicht aller getätigten Spenden mit Filter- und Sortieroptionen.
- **Admin-Bereich:** Geschützter Bereich für Administratoren mit PIN-Authentifizierung.
- **Spendenexport:** Export der gesamten Spendenhistorie als CSV-Datei im Admin-Bereich.
- **Progressive Web App (PWA):** Installierbar auf Geräten und offline-fähig für verbesserte Benutzerfreundlichkeit.
- **Zentrale Fehlerbehandlung:** Eine React Error Boundary fängt UI-Fehler ab.
- **Zentrale Benachrichtigungen:** Snackbar-Benachrichtigungen für Aktionen (z.B. "Spende erfolgreich gespeichert!").

## Technologien

- **Frontend:** React mit TypeScript
- **Styling:** Material-UI (MUI) für UI-Komponenten und konsistentes Design
- **Routing:** React Router DOM
- **Internationalisierung:** react-i18next
- **Lokale Datenbank:** Dexie.js (für IndexedDB im Browser)
- **QR-Code-Generierung:** qrcode.react
- **Build-Tool:** Vite
- **Testing:** Vitest, React Testing Library, jsdom
- **PWA:** vite-plugin-pwa

## Installation und Setup

### Voraussetzungen
- Node.js (v18 oder neuer empfohlen)
- npm (oder yarn/pnpm)

### Abhängigkeiten installieren
Navigieren Sie in das Projektverzeichnis (`aikf-kiosk-app/`) und installieren Sie die Abhängigkeiten:
```bash
cd aikf-kiosk-app/
npm install
# oder yarn install
# oder pnpm install
```

### Admin-PIN und Konfiguration (`.env`)
Um die Admin-PIN und andere sensible Daten nicht direkt im Quellcode zu haben, verwenden wir Umgebungsvariablen.

1.  **Erstellen Sie eine `.env`-Datei:**
    Legen Sie im Root-Verzeichnis des Projekts (`aikf-kiosk-app/`) eine Datei namens `.env` an.

2.  **Fügen Sie Ihre Admin-PIN hinzu:**
    ```
    VITE_ADMIN_PIN=IHRE_GEHEIME_PIN
    ```
    Ersetzen Sie `IHRE_GEHEIME_PIN` durch die gewünschte PIN.

3.  **Optionale Konfigurationen (SEPA, Zahlungslink):**
    Sie können auch SEPA-Details und einen generischen Zahlungslink über Umgebungsvariablen definieren, die die Standardwerte in `src/config.ts` überschreiben:
    ```
    VITE_SEPA_BIC=DEIN_BIC
    VITE_SEPA_NAME=DEIN_ORGANISATIONSNAME
    VITE_SEPA_IBAN=DEINE_IBAN
    VITE_PAYMENT_LINK=https://dein.zahlungslink.com/pay
    ```

### Lokale Entwicklung starten
```bash
npm run dev
```
Die App ist dann unter `http://localhost:5173` (oder einem ähnlichen Port) verfügbar.

## Produktion-Build erstellen
Für den Einsatz auf einem Webserver erstellen Sie einen optimierten Build:
```bash
npm run build
```
Dies erzeugt den `dist/`-Ordner, der alle statischen Dateien für die Bereitstellung enthält.

## Nutzung des Admin-Bereichs
1.  Navigieren Sie in der laufenden Anwendung zu `/admin`.
2.  Geben Sie die in der `.env`-Datei konfigurierte **Admin-PIN** ein.
3.  Im Admin-Bereich können Sie die **Spendenhistorie einsehen und als CSV-Datei exportieren**.

## Tests ausführen
Um die Unit- und Integrationstests auszuführen:
```bash
npm test
```
Die Vitest-Konfiguration ist in `vite.config.ts` definiert und verwendet `jsdom` als Testumgebung.

## Wichtige Hinweise zur Sicherheit

### Admin-PIN
Obwohl die Admin-PIN über Umgebungsvariablen geladen wird, ist sie im finalen JavaScript-Bundle weiterhin **auslesbar**. Für Anwendungen mit sehr hohen Sicherheitsanforderungen (z.B. sensible Nutzerdaten, Finanztransaktionen, die über den Kiosk hinausgehen) wäre ein **Backend mit serverseitiger Authentifizierung** und Autorisierung dringend erforderlich. Für den lokalen Kiosk-Einsatz bietet die aktuelle Lösung jedoch einen praktischen Schutz vor neugierigen Blicken in den Quellcode.

## Zukünftige Optimierungsideen

-   **Backend-Integration:** Für eine zentrale Speicherung der Spenden und erweiterte Admin-Funktionen (Nutzerverwaltung, erweiterte Berichte, sichere PIN-Verwaltung) wäre die Anbindung an ein Backend empfehlenswert.
-   **Erweiterte Admin-Einstellungen:** Implementierung von Bearbeitungsfunktionen für Kiosk-Einstellungen direkt im Admin-Bereich.
-   **Zahlungs-Gateways:** Integration von echten Zahlungs-Gateways anstelle von reinen QR-Codes und Links.
-   **Theming-Umschaltung:** Implementierung eines Dark/Light-Mode-Umschalters mit Material-UI.
-   **Längere Historie:** Optimierung der Datenbankabfrage für sehr große Spendenhistorien, falls die Performance beeinträchtigt wird.
