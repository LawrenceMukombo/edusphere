// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CampusProvider } from '@/components/CampusContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legacy School Solwezi — EduSphere SMIS Enterprise',
  description: 'Zambia-first, enterprise-grade School Management Information System for Legacy School Solwezi (Mushitala Day Campus & Kansanshi Boarding Campus).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CampusProvider>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
              {children}
            </main>
          </div>
        </CampusProvider>
      </body>
    </html>
  );
}
