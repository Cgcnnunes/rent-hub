import { messages } from '@rent-hub/localization';
import type { ReactNode } from 'react';

export default function Home(): ReactNode {
  return (
    <main>
      <h1>{messages.productName}</h1>
      <p>{messages.developmentNotice}</p>
    </main>
  );
}
