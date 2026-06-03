/* LifeOS does not use Firebase Cloud Messaging — quiet no-op for stray browser requests */
self.addEventListener("install", () => self.skipWaiting());
