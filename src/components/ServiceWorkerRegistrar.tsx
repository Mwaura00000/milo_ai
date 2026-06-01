"use client";

import Script from "next/script";

export function ServiceWorkerRegistrar() {
  return (
    <Script
      id="sw-register"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(function(reg) { console.log('[Milo SW] Registered, scope:', reg.scope); })
                .catch(function(err) { console.warn('[Milo SW] Registration failed:', err); });
            });
          }
        `,
      }}
    />
  );
}
