#!/bin/bash
set -euo pipefail
echo "AIKF Kiosk Update wird gestartet..."
cd /opt/stacks/aikf-kiosk-app
if [ -n "$(git status --porcelain)" ]; then
  echo "Abbruch: uncommittete Aenderungen im Arbeitsverzeichnis." >&2
  exit 1
fi
git checkout main
git pull --ff-only origin main
cd /opt/stacks/web
docker compose up -d --build aikf-kiosk
for i in $(seq 1 12); do
  if [ "$(docker inspect -f "{{.State.Health.Status}}" aikf-kiosk)" = "healthy" ]; then
    echo "Fertig: https://kiosk.fechal-batakpale.com"
    exit 0
  fi
  sleep 5
done
echo "Abbruch: aikf-kiosk wurde nicht healthy." >&2
exit 1
