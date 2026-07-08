import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
  description:
    "Transform your public GitHub activity into a premium, cinematic annual coding recap. Discover your coding streaks, favorite languages, and achievements.",
  keywords: ["GitHub", "Wrapped", "GitWrapped", "Recap", "Developer", "Year in Code", "Framer Motion"],
  openGraph: {
    title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
    description: "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
    type: "website",
    url: "https://gitwrapped.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitWrapped — Your Year in Code, Beautifully Wrapped",
    description: "Transform your public GitHub activity into a premium, cinematic annual coding recap.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider defaultTheme="minimal">{children}</ThemeProvider>
      </body>
    </html>
  );
}
