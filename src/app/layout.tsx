import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Circus Liquor | Cinematic Spirits Experience",
  description: "Discover a world of exceptional spirits, crafted moments, and timeless taste. An experience beyond the ordinary.",
  keywords: ["Circus Liquor", "Fine Spirits", "Luxury Liquors", "Rare Vintages", "Grey Goose Reserve"],
  openGraph: {
    title: "Circus Liquor — An Experience Beyond the Ordinary",
    description: "Discover exceptional spirits, crafted moments, and timeless taste.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
