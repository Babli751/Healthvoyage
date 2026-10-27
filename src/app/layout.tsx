import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { RevealManager } from "@/components/Reveal";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthVoyage — Health Resorts & Sanatoriums Abroad",
  description:
    "Compare 62 trusted health resorts in 7 countries. Mineral springs, Naftalan oil, thermal baths and rehabilitation, with free coordinator support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Footer />
        <RevealManager />
      </body>
    </html>
  );
}
