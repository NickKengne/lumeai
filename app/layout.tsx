import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  metadataBase: new URL('https://lumeai.com'),
  title: {
    default: 'Lume AI - Turn App Screenshots into Beautiful App Store Visuals',
    template: '%s | Lume AI'
  },
  description: 'AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute. Upload screenshots, get perfect mockups with headlines, ready for submission.',
  keywords: [
    'App Store screenshots',
    'iOS app marketing',
    'app store optimization',
    'ASO tool',
    'screenshot generator',
    'app mockups',
    'iPhone mockups',
    'app store visuals',
    'mobile app marketing',
    'AI screenshot designer',
    'app launch tools',
    'indie developer tools',
    'app store assets'
  ],
  authors: [{ name: 'Lume AI' }],
  creator: 'Lume AI',
  publisher: 'Lume AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lumeai.com',
    siteName: 'Lume AI',
    title: 'Lume AI - Turn App Screenshots into Beautiful App Store Visuals',
    description: 'AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute. No design skills required.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lume AI - App Store Screenshot Generator',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lume AI - Turn App Screenshots into Beautiful App Store Visuals',
    description: 'AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute.',
    images: ['/images/twitter-image.png'],
    creator: '@lumeai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Raleway:wght@400;600;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&family=Oswald:wght@400;600;700&family=PT+Sans:wght@400;700&family=Ubuntu:wght@400;500;700&family=Work+Sans:wght@400;500;600&family=DM+Sans:wght@400;500;700&family=Rubik:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Barlow:wght@400;500;600&family=Karla:wght@400;500;700&family=Lexend:wght@400;500;600&family=Sora:wght@400;500;600&family=Epilogue:wght@400;500;600&family=Red+Hat+Display:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&family=Mulish:wght@400;600;700&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans tracking-tight`}
      >
        {children}
      </body>
    </html>
  );
}
