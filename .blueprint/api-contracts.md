# API Contracts — AIKF Donation Kiosk

Basis: **relativ** `/api` (nginx proxied auf `aikf-kiosk-api:3001`). JSON, `Content-Type: application/json`.

## Header

| Header | Wann | Bedeutung |
|---|---|---|
| `Authorization: Bearer <jwt>` | Admin-/Donation-Lesezugriffe | Token aus `POST /api/admin/login` |
| `X-Kiosk-Token` | alle Kiosk-Aufrufe | Pairing-Token aus `localStorage['aikf-kiosk-pair']` |
| `Idempotency-Key` | `POST /donations`, `POST /stripe/checkout`, `POST /stripe/terminal` | verhindert Doppelbuchung |

## Endpunkte (aus `src/api.ts` + Backend-Routen)

| Methode | Pfad | Auth | Antwort |
|---|---|---|---|
| POST | `/api/donations` | — | `{ id, status }` — Limit 120/15 min |
| GET | `/api/donations?page&limit` | Bearer | `{ data: Donation[], pagination }` |
| GET | `/api/donations/:id` | Bearer | `Donation` |
| PATCH | `/api/donations/:id/reconcile` | Bearer | `{ status }`, Body `{ reference }` |
| DELETE | `/api/donations/:id` | Bearer | `{ message }` |
| GET | `/api/donations/:id/receipt` | Bearer | PDF/Beleg |
| POST | `/api/admin/login` | — | `{ token, admin, mustChangePassword? }` — Limit 8/15 min |
| GET | `/api/admin/me` | Bearer | `{ admin: { id, email }, mustChangePassword? }` |
| POST | `/api/admin/password` | Bearer | `{ changed }`, Body `{ currentPassword, newPassword }` |
| GET | `/api/admin/stats` | Bearer | `AdminStats` |
| GET | `/api/stripe/config` | — | `PaymentConfig` (Verfügbarkeit; keine Schlüssel) |
| POST | `/api/stripe/pair` | Bearer | `{ token }` (Terminal-Pairing) |
| POST | `/api/stripe/checkout` | — | `PaymentSession` |
| POST | `/api/stripe/terminal` | Kiosk-Token | `PaymentSession` |
| GET | `/api/stripe/status/:id` | Bearer | `{ status, amount, category, attemptFailed?, processing?, url? }` |
| POST | `/api/stripe/cancel/:id` | Bearer | `{ status, processing? }` |
| POST | `/api/stripe/webhook` | Stripe-Signatur | Raw-Body, 256 kb Limit |
| GET | `/api/health` | — | Health des Backends |

## Status-Codes / Fehler

- Fehlerformat: `{ "error": "<text>" }` — der Client zeigt `error` direkt an.
- `429`: Rate-Limit (nginx `limit_req` 10 r/s burst 30 für `/api/`, Backend-Limits pro Route). Client muss 429 als „später erneut" behandeln, nicht als Abbruch.
- `401/403`: Token fehlt/abgelaufen → neu pairen bzw. Login.

## Zahlungsablauf seit UX-Release 2026-11-02

- `POST /api/stripe/prepare`: `{ amount, category, donorName, donorEmail, method: "online" | "terminal" }`, `Idempotency-Key`; für Terminal zusätzlich `X-Kiosk-Token`. Antwort `{ donationId, token }`, noch keine Zahlung gestartet.
- Browser speichert den Versuch in `sessionStorage`, erst danach `/checkout` oder `/terminal` mit derselben ID. Statusabfrage stellt bei Bedarf eine offene Checkout-URL wieder her.
- `POST /api/stripe/recover/:id`: korrekt signierter Payment-Status-Bearer, auch nach Ablauf; Terminal zusätzlich gekoppelt. Erneuert ausschließlich den Status-/Abbruch-Token desselben Vorgangs, keine Adminrechte.
- SEPA: `/donations` muss vor der Ausgabe des GiroCodes erfolgreich antworten. Status bleibt bis zum Bankabgleich `pending`.
- Zahlungsvorgänge mit Stripe-ID sowie offene oder bestätigte Spenden sind gegen physisches Löschen geschützt. Nur fehlgeschlagene/stornierte SEPA-Datensätze sind löschbar.
- Start, Abbruch und Wiederaufnahme werden je Vorgang im einzelnen API-Prozess serialisiert. Vor Skalierung auf mehrere Instanzen ist eine gemeinsame Sperre erforderlich.
