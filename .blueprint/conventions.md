# Conventions — AIKF Donation Kiosk

## Stack-Invarianten

- React + TypeScript + Vite, UI über MUI/Emotion (`@mui/material`), Icons `lucide-react`.
- i18n ausschließlich über `i18next` (`src/i18n.ts`), keine hartkodierten UI-Strings.
- Keine Spendendaten oder Admin-Tokens in `localStorage`; Zahlungsstatus und Admin-JWT liegen ausschließlich in `sessionStorage`.
- Build ist `tsc && vite build` — TypeScript-Fehler brechen den Build, kein `any` als Ausweg.

## Typisierung

- API-Antworten in `src/api.ts` als `interface` deklariert; neue Endpunkte dort typisieren, nicht im Component-Layer.
- `request<T>()` ist der einzige HTTP-Pfad (30 s Timeout, `cache: "no-store"`, Fehler als `Error(message)`).

## Tests (Mindestanforderung)

- `npm test` (= `vitest run`) muss grün sein; Tests liegen in `src/__tests__/`.
- Pflicht bei Änderungen an Geldlogik (`src/utils/payment.ts`), API-Client (`src/api.ts`), Auth-Kontext: mindestens ein Test, der den geänderten Pfad ausführt.
- Kein Merge ohne grünen Lauf von `hetzner-deploy.yml` und `android-apk.yml`.

## Sicherheit

- Keine Secrets im Bundle: nur öffentliche Empfängerdaten (`VITE_SEPA_*`, `VITE_MOSQUE_SEPA_*`). Auth läuft ausschließlich über das Backend.
- CSP in `nginx-kiosk.conf` mitpflegen, sobald ein externer Host dazukommt (aktuell nur `checkout.stripe.com` in `form-action`).
- Kiosk-Token gehört in `localStorage['aikf-kiosk-pair']`, nie in die URL.
