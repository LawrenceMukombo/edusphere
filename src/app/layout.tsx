// src/app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { TopWelcomeBanner } from '@/components/TopWelcomeBanner';
import { Sidebar } from '@/components/Sidebar';
import { CampusProvider } from '@/components/CampusContext';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Legacy School Solwezi — EduSphere SMIS Enterprise',
  description:
    'Zambia-first, enterprise-grade, offline-first School Management Information System for Legacy School Solwezi (Mushitala Day Campus & Kansanshi Boarding Campus).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduSphere',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
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
        <ServiceWorkerRegistration />
        <CampusProvider>
          <TopWelcomeBanner />
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 w-full max-w-none overflow-y-auto min-w-0">
              {children}
            </main>
          </div>
        </CampusProvider>
      </body>
    </html>
  );
}
