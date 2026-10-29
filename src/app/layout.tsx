import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { ClientLayout } from '@/components/ClientLayout';
import '@/index.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ELRIZO - Siz rozi — biz rozi! | Nasiya Savdo Bozori',
  description: "ELRIZO NASIYA SAVDO — 0-0-12 Halol va qulay nasiya savdo do'koni. O'zbekiston bo'ylab 24 soatda bepul yetkazib berish va 1 yillik rasmiy kafolat.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const themeInitScript = `
  try {
    const stored = localStorage.getItem('elrizo_store_v3') || localStorage.getItem('elrizo_nasiya_storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-[#F8F9FA] dark:bg-slate-900 text-[#1F2937] dark:text-gray-100 font-sans antialiased selection:bg-purple-200 selection:text-purple-900">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Suspense fallback={null}>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}

