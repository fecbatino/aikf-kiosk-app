# CLAUDE.md

## Blueprint (verbindlich)

> Before making changes, consult `.blueprint/architecture.md` and adhere strictly to system conventions.

| Datei | Inhalt |
|---|---|
| `.blueprint/architecture.md` | Komponenten, Container, Ports, Datenflüsse |
| `.blueprint/conventions.md` | Stack-Invarianten, Typisierung, Test-Mindestanforderungen |
| `.blueprint/api-contracts.md` | Endpunkte, Payload-Schemas, Status-Codes |

Der Blueprint ist kurz gehalten (je < 70 Zeilen) — er ersetzt kein Lesen des Codes, aber er ist die erste Quelle für Architektur- und Vertragsfragen.

## Commands

```sh
npm run dev          # Vite dev server
npm run build        # tsc && vite build
npm test             # vitest run
npm run build:android && npm run cap:sync   # Capacitor-APK
```

## Deploy

- Live: `kiosk.fechal-batakpale.com`. Push auf `main` startet `.github/workflows/hetzner-deploy.yml` (Build auf dem Server, `docker compose up -d --no-deps aikf-kiosk`); `android-apk.yml` baut die APK.
- Compose-Eintrag: `/opt/stacks/web/docker-compose.yml`, Service `aikf-kiosk`, Image `web-aikf-kiosk:*`.
- Nach dem Deploy prüfen: HTML referenziert das neue `assets/index-*.js`, `sw.js` trägt einen neuen `CACHE_NAME`.

## Context Preservation

- Dateien > 250 Zeilen nie komplett lesen — gezielt `grep`, `head`, `tail` oder Read mit `offset`/`limit`.
- `node_modules/`, `dist/`, `android/`, `package-lock.json` nicht lesen.
- Build-/Testausgaben begrenzen, ohne den Exit-Code zu verlieren: `npm test 2>&1 | tail -n 20; echo "exit=${PIPESTATUS[0]}"`.
- Nach einem Edit nicht zur Kontrolle neu einlesen.
