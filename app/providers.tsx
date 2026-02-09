'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('crm_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.theme) {
        applyTheme(parsed.theme as ThemeMode);
      }
    } catch {
      // ignore
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
