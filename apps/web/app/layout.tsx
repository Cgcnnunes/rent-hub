import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
