import type { Metadata } from "next";
import { Inter, Barlow_Condensed, Tajawal } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://dullys-menu-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "DULLY'S — Digital Menu 2026",
  description: "Explore the contemporary beverage selection from DULLY'S, featuring hot tea, tea lattes, iced tea, boba milk, and snow ice.",
  keywords: ["Dully's", "Boba Tea", "Matcha Latte", "Hojicha", "Japanese Tea", "Snow Ice", "Beverage Menu"],
  openGraph: {
    title: "DULLY'S — Digital Menu 2026",
    description: "Explore the contemporary beverage selection from DULLY'S, featuring hot tea, tea lattes, iced tea, boba milk, and snow ice.",
    url: siteUrl,
    siteName: "DULLY'S",
    images: [
      {
        url: "/brand/dullys-og.png",
        width: 1200,
        height: 630,
        alt: "DULLY'S — Digital Menu",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DULLY'S — Digital Menu 2026",
    description: "Explore the contemporary beverage selection from DULLY'S, featuring hot tea, tea lattes, iced tea, boba milk, and snow ice.",
    images: ["/brand/dullys-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-crimson selection:text-white">
        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
