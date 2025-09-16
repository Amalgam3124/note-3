import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Note3 - Decentralized Note Taking',
  description: 'A decentralized note-taking application built on Filecoin storage, featuring blockchain-based data persistence and modern web technologies.',
  keywords: ['Filecoin', 'Notes', 'Decentralized', 'Blockchain', 'Storage', 'Web3'],
  authors: [{ name: 'Note3 Team' }],
  openGraph: {
    title: 'Note3 - Decentralized Note Taking',
    description: 'Store your notes on Filecoin with decentralized storage and Web3 integration.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
