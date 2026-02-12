import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess - Play Against AI',
  description: 'A modern chess platform to play against AI bots with multiple difficulty levels.',
  applicationName: 'Chess AI',
  keywords: ['chess', 'ai', 'nextjs', 'strategy game', 'board game'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
