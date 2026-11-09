import { Inter } from "next/font/google";
import "./globals.css";
import SiteProvider from "@/components/SiteProvider";
import CartProvider from "@/components/CartProvider";
import HideOnAdmin from "@/components/HideOnAdmin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings, getMenu } from "@/lib/data";

const inter = Inter({ subsets: ["latin"], variable: "--font", display: "swap" });

export const dynamic = "force-dynamic"; // always read fresh data from MongoDB
export const metadata = {
  title: { default: "FRENVIX | Hoodies, Sweatshirts & Henleys", template: "%s | FRENVIX" },
  description: "Heavyweight hoodies, sweatshirts and henleys. Order without an account. Cash on delivery in Bangladesh.",
};
export const viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SiteProvider settings={settings}>
          <CartProvider>
            <HideOnAdmin><Header menu={menu} /></HideOnAdmin>
            <main>{children}</main>
            <HideOnAdmin><Footer settings={settings} menu={menu} /></HideOnAdmin>
          </CartProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
