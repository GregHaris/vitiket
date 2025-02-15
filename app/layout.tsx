import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Vitiket',
  description: 'An Event management app',
  icons: '/assets/images/logo.png',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable}antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
