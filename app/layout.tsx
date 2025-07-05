import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "aOSINT - Advanced Open Source Intelligence Platform",
    template: "%s | aOSINT - Plateforme OSINT Avancée"
  },
  description: "Plateforme d'intelligence open source avancée pour la recherche OSINT, l'analyse de domaines, la reconnaissance IP, l'investigation sociale et l'analyse de métadonnées. Outils professionnels pour les enquêteurs numériques.",
  keywords: [
    "OSINT",
    "Open Source Intelligence",
    "Investigation numérique",
    "Analyse de domaines",
    "Reconnaissance IP",
    "Investigation sociale",
    "Métadonnées",
    "Géolocalisation",
    "Réseaux sociaux",
    "Cybersécurité",
    "Recherche de personnes",
    "Dark web",
    "Crypto analyse",
    "Fuites de données",
    "Intelligence artificielle",
    "Enquête digitale"
  ],
  authors: [{ name: "aOSINT Team" }],
  creator: "aOSINT",
  publisher: "aOSINT Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aosint.com'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://aosint.com',
    title: 'aOSINT - Plateforme OSINT Avancée',
    description: 'Plateforme d\'intelligence open source avancée pour la recherche OSINT, l\'analyse de domaines, la reconnaissance IP et l\'investigation sociale.',
    siteName: 'aOSINT',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'aOSINT - Advanced Open Source Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'aOSINT - Plateforme OSINT Avancée',
    description: 'Outils professionnels d\'intelligence open source pour les enquêteurs numériques',
    images: ['/twitter-image.jpg'],
    creator: '@aOSINT',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Cybersecurity and Intelligence Tools',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00ff88' },
    { media: '(prefers-color-scheme: dark)', color: '#00ff88' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#00ff88' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'aOSINT',
  },
  applicationName: 'aOSINT Platform',
  generator: 'Next.js',
  abstract: 'Plateforme avancée d\'intelligence open source pour professionnels de la cybersécurité et enquêteurs numériques',
  archives: ['https://aosint.com/archives'],
  assets: ['https://aosint.com/assets'],
  bookmarks: ['https://aosint.com/bookmarks'],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#00ff88',
    'og:image:alt': 'aOSINT - Advanced Open Source Intelligence Platform',
    'og:image:type': 'image/jpeg',
    'og:image:width': '1200',
    'og:image:height': '630',
    'article:author': 'aOSINT Team',
    'article:publisher': 'https://aosint.com',
    'fb:app_id': 'your-facebook-app-id',
    'al:web:url': 'https://aosint.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="aOSINT" />
        <meta name="application-name" content="aOSINT" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#00ff88" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "aOSINT",
              "description": "Plateforme d'intelligence open source avancée pour la recherche OSINT, l'analyse de domaines, la reconnaissance IP, l'investigation sociale et l'analyse de métadonnées",
              "url": "https://aosint.com",
              "applicationCategory": "SecurityApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "creator": {
                "@type": "Organization",
                "name": "aOSINT Team"
              },
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString(),
              "inLanguage": "fr-FR",
              "isAccessibleForFree": true,
              "keywords": "OSINT, Open Source Intelligence, Investigation numérique, Cybersécurité",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://aosint.com"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
