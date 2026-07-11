import type { Metadata } from "next";
import { Inter, Barlow_Condensed, Tajawal } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";

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

export const metadata: Metadata = {
  title: "DULLY'S — Premium Asian Beverage Immersive Digital Menu",
  description: "Experience the premium Asian beverage brand DULLY'S. Immerse yourself in our Japanese-inspired visual ritual menu featuring premium hot teas, rich lattes, cold boba tea, and volcanic snow ice altars.",
  keywords: ["Dully's", "Boba Tea", "Matcha Latte", "Hojicha", "Japanese Tea", "Snow Ice", "Premium Beverages"],
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
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
