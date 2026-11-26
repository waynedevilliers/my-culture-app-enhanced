'use client';

import '@/i18n/i18n.js';
import Root from '@/Root.jsx';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Root>{children}</Root>;
}
