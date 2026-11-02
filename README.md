# AIKF Spendenkiosk

Die aktuelle Version und der produktive Zahlungsablauf sind in [RELEASE-2026-11-01.md](RELEASE-2026-11-01.md) dokumentiert. Dort stehen auch Terminalberatung, Voraussetzungen für Kartenzahlung, Grenzen und Prüfbefehle.

Die Oberfläche führt durch Betrag und Spendenzweck, freiwillige Spenderangaben und Zahlung. Anonyme Spenden sind voreingestellt. Die Verwaltung nutzt serverseitige Anmeldung statt einer Browser-PIN.

## Lokale Entwicklung

```sh
npm ci
npm run dev
```

Der Entwicklungsserver bindet an `127.0.0.1`. `/api` wird für lokale Tests an Port 4174 weitergeleitet. Die ausschließlich im Arbeitsspeicher laufende Zahlungsattrappe lässt sich im benachbarten API-Projekt nach dem Build mit `node tests/preview.cjs` starten. Sie ist kein Zahlungsanbieter und gehört nicht in den Produktivbetrieb.

## Build und Tests

```sh
npm run build
npm test
```

Die öffentliche Bankverbindung wird über `VITE_SEPA_IBAN`, `VITE_SEPA_BIC` und `VITE_SEPA_NAME` konfiguriert. Geheimnisse dürfen nicht in `VITE_*`-Variablen stehen. Die erzeugten Dateien in `dist` werden über Nginx ausgeliefert.

## Produktivbetrieb

Backend und Frontend werden als getrennte Container betrieben. Die API benötigt PostgreSQL sowie private serverseitige Konfiguration. Migrationen, Sicherung und Rückfallversion müssen vor einem Deployment bereitstehen. Der API-Container startet ohne automatische Schemaänderung.

Kartenzahlung darf erst nach Händlerfreigabe, signiertem Webhook und erfolgreichen Tests aktiviert werden. Eine reine girocard-Zahlung benötigt das passende Terminal. Die neue Version enthält eine Stripe-Smart-Terminal-Anbindung, aber keine fertige PAYONE- oder SumUp-Integration.
