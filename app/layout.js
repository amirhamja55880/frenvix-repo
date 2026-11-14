import { Inter } from "next/font/google";
import "./globals.css";
import SiteProvider from "@/components/SiteProvider";
import CartProvider from "@/components/CartProvider";
import HideOnAdmin from "@/components/HideOnAdmin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { getSettings, getMenu } from "@/lib/data";
import { siteUrl, orgJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font", display: "swap" });

export async function generateMetadata() {
  const s = await getSettings();
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: { default: "FRENVIX | Hoodies, Sweatshirts & Henleys", template: "%s | FRENVIX" },
    description: "Heavyweight hoodies, sweatshirts and henleys. Order without an account. Cash on delivery in Bangladesh.",
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: "FRENVIX", locale: "en_BD", url: base, title: "FRENVIX | Hoodies, Sweatshirts & Henleys", description: "Heavyweight hoodies, sweatshirts and henleys delivered across Bangladesh.", images: [{ url: "/logo.png" }] },
    twitter: { card: "summary_large_image" },
    verification: s.gscVerification ? { google: s.gscVerification } : undefined,
  };
}
export const viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd(settings)) }} />
        <SiteProvider settings={settings}>
          <Analytics />
          <CartProvider>
            <HideOnAdmin><Header menu={menu} announcements={settings.announcements} /></HideOnAdmin>
            <main>{children}</main>
            <HideOnAdmin><Footer settings={settings} menu={menu} /></HideOnAdmin>
          </CartProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
