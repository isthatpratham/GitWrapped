import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#02040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gitwrapped.dev"),
  title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
  description:
    "Transform your public GitHub activity into a premium, cinematic annual coding recap. Discover your coding streaks, favorite languages, and achievements.",
  keywords: [
    "GitHub",
    "Wrapped",
    "GitWrapped",
    "Recap",
    "Developer",
    "Year in Code",
    "Framer Motion",
    "GitHub Wrapped",
    "Software Engineer Portfolio",
  ],
  applicationName: "GitWrapped",
  authors: [{ name: "GitWrapped Team", url: "https://gitwrapped.dev" }],
  creator: "GitWrapped",
  publisher: "GitWrapped",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
    description:
      "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
    type: "website",
    url: "https://gitwrapped.dev",
    siteName: "GitWrapped",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitWrapped - Your Year in Code, Beautifully Wrapped",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
    description:
      "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
    creator: "@gitwrapped",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GitWrapped",
    "url": "https://gitwrapped.dev",
    "description":
      "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider defaultTheme="minimal">{children}</ThemeProvider>
      </body>
    </html>
  );
}

