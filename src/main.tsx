import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./fonts.css";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./i18n";
import ThemeWrapper from "./ThemeWrapper";
import ErrorBoundary from "./ErrorBoundary";

// A fresh deployment can replace a lazy-loaded chunk while a kiosk tab is open.
// Payment identifiers already live in sessionStorage and survive this refresh.
window.addEventListener("vite:preloadError", (event) => {
  const previous = Number(sessionStorage.getItem("aikf-last-chunk-refresh") || 0);
  if (Date.now() - previous < 30000) return;
  event.preventDefault();
  sessionStorage.setItem("aikf-last-chunk-refresh", String(Date.now()));
  window.location.reload();
});

// Long-press menus on the kiosk screens lead away from the donation flow; inputs keep theirs.
window.addEventListener("contextmenu", (event) => {
  if (document.querySelector(".kiosk-content") && !(event.target as Element).closest("input, textarea")) {
    event.preventDefault();
  }
});

// Service Worker für PWA registrieren
if ("serviceWorker" in navigator && import.meta.env.BASE_URL === "/") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(
      (registration) => {
        console.log("SW registered:", registration.scope);
      },
      (err) => {
        console.log("SW registration failed:", err);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ThemeWrapper>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeWrapper>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
