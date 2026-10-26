// src/app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NwuchasShell } from '@/components/NwuchasShell';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#007B99',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'NWUCHAS-CMIS — North Western University College of Health and Applied Sciences',
  description:
    'Dedicated Integrated College Management Information System for North Western University College of Health and Applied Sciences (NWUCHAS), Manyama, Lumwana, Zambia.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <NwuchasShell>
          {children}
        </NwuchasShell>
      </body>
    </html>
  );
}
