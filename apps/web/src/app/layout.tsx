import type { Metadata } from 'next';
import { Cormorant_Garamond, Syne, DM_Sans } from 'next/font/google';
import '../styles/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmogilevtsev.ru';
const DEFAULT_TITLE = 'Dmitry Mogilevtsev — Fullstack Engineer & AI Product Architect';
const DEFAULT_DESCRIPTION =
  'Fullstack engineer and AI product architect. From landing pages and marketing sites to complex SaaS with AI agents. React, Next.js, NestJS, and scalable architecture.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  // Root-level defaults so scrapers that hit the bare domain (before
  // next-intl redirects them to /ru or /en) still get a valid preview.
  // next/og auto-resolves `opengraph-image.tsx` alongside this layout.
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Dmitry Mogilevtsev',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    creator: '@mogilevtsevdmitry',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${cormorant.variable} ${syne.variable} ${dmSans.variable} flex flex-col min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
