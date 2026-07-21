"use client";

import { useEffect } from "react";

// Registra el service worker (solo en el navegador, tras montar).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin PWA si falla */
      });
    }
  }, []);
  return null;
}
