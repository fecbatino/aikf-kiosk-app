# Architecture — AIKF Donation Kiosk (`aikf-kiosk-app`)

Zweck: PWA-Spendenkiosk der AIKF e.V. (Touch-Gerät im Foyer), Spendenerfassung + SEPA/GiroCode + Stripe.

## Komponenten (verifiziert 2026-11-02)

| Komponente | Fakt |
|---|---|
| Container | `aikf-kiosk`, Image `web-aikf-kiosk:ux-merged-20261102` |
| Build | `node:22-alpine` → `tsc && vite build` → `nginx:1.30-alpine`, `EXPOSE 80` |
| Netz | `web-network`, intern kein TLS (TLS endet am Proxy) |
| Härtung | `read_only: true`, tmpfs `/var/cache/nginx /var/run /tmp`, `cap_drop: ALL` + nur `CHOWN SETGID SETUID NET_BIND_SERVICE` |
| Healthcheck | `curl -f http://localhost:80/` alle 30 s |
| Domain | `kiosk.fechal-batakpale.com` (Cloudflare-CDN davor) |
| Origin | `cf-web-guard` (raw/PREROUTING, Modus `monitor`) — kein Direktzugriff auf 80/443 außer Cloudflare |

## Datenfluss

```
Kiosk (React) --fetch /api--> nginx-kiosk.conf --proxy--> aikf-kiosk-api:3001
                                   |                        |
                          /assets/* 1y immutable      Stripe + Postgres
                          /sw.js, /index.html no-store
Cloudflare Edge -> Origin (nginx im Container)
Client-Storage: sessionStorage ('aikf-payment', 'aikf_kiosk_jwt'), localStorage ('aikf-kiosk-pair', 'aikf-theme')
```

## Deploy

- CI: `.github/workflows/hetzner-deploy.yml` (Push auf `main` → Build auf Server → `docker compose up -d --no-deps aikf-kiosk`), `.github/workflows/android-apk.yml` (Capacitor-APK).
- Compose-Quelle: `/opt/stacks/web/docker-compose.yml`, Service `aikf-kiosk`, Build-Kontext `/opt/stacks/aikf-kiosk-app`.
- Live-Prüfung: HTML muss auf das aktuelle `assets/index-*.js` zeigen; `sw.js` trägt `CACHE_NAME = aikf-kiosk-<BUILD_ID>`.

## Fallstricke

- `read_only` + tmpfs: nginx braucht `/var/cache/nginx`, `/var/run`, `/tmp` als tmpfs, sonst startet der Container nicht.
- Service Worker ist der einzige Update-Kanal: falsche Cache-Header an der Kante halten Geräte auf dem alten Bundle.

## UX-Release 2026-11-02

- Anonyme Spende: Betrag/Zweck → Zahlung. Freiwillige Kontaktdaten öffnen einen zusätzlichen Schritt.
- Informationsseiten öffnen im Kiosk als Dialog; die Eingaben und Bankreferenz bleiben erhalten.
- SEPA-Absicht wird vor dem QR-Code gespeichert. Banken bestätigen den Eingang weiterhin erst beim Admin-Abgleich.
- Rückkehr zur öffentlichen Oberfläche meldet Administratoren ab; Admin-Inaktivität endet nach fünf Minuten.
