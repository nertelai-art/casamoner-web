import type { Metadata, Viewport } from 'next';
import { Fraunces, Jost } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { JsonLd } from '@/components/JsonLd';
import { site } from '@/data/site';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { siteInfo } from '@/lib/seo/site-info';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    images: [{ url: site.ogImage, width: 2000, height: 1125, alt: 'Aparador de pans de casamoner' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf6ee' },
    { media: '(prefers-color-scheme: dark)', color: '#16110d' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca" data-scroll-behavior="smooth" className={`${fraunces.variable} ${jost.variable}`}>
      <body>
        <a className="skip-link" href="#contingut">
          Salta al contingut
        </a>
        <Header />
        <main id="contingut">{children}</main>
        <Footer />
        <JsonLd data={organizationJsonLd(siteInfo)} />
        <JsonLd data={websiteJsonLd(siteInfo)} />
      </body>
    </html>
  );
}
