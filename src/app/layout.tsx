import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthVoyage — Health Resorts & Sanatoriums Abroad",
  description:
    "Compare trusted health resorts abroad. Mineral springs, Naftalan oil, thermal baths and rehabilitation, with free coordinator support.",
};

// Root layout: provides <html>/<body> for every branch (admin, api, and the
// localized public site). The locale-specific chrome (i18n provider, Footer)
// lives in src/app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
