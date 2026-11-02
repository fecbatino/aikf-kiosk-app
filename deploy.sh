#!/bin/bash
echo "🕌 AIKF Kiosk Update wird gestartet..."
cd /opt/stacks/aikf-kiosk-app
git pull origin main
cd /opt/stacks/web
docker compose up -d --build aikf-kiosk
echo "✅ Fertig! https://kiosk.fechal-batakpale.com"
