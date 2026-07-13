'use client';

import { useState, useEffect } from 'react';

export default function FooterDiagnostics() {
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    fetch('http://127.0.0.1:8000/api/login', { method: 'OPTIONS' })
      .then(() => {
        setPing(Math.round(performance.now() - start));
      })
      .catch(() => setPing(null));
  }, []);

  return (
    <footer className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[9px] text-neutral-600">
      <div>SYSTEM v1.0.0 // PRIVATE LEDGER</div>
      <div className="flex items-center gap-3">
        <span>ENGINE: NEXTJS_15</span>
        <span>API_LATENCY: {ping !== null ? `${ping}ms` : 'OFFLINE'}</span>
      </div>
    </footer>
  );
}