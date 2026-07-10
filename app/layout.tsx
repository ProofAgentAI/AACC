import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aaccusa.org"),
  title: {
    default: "AACC-USA | Algerian American Chamber of Commerce USA",
    template: "%s | AACC-USA",
  },
  description:
    "AACC-USA is a U.S.-based nonprofit chamber-style association connecting Algerian-American entrepreneurs, professionals, investors, and institutions to expand trade, investment, and opportunity between the United States and Algeria.",
  keywords: [
    "Algerian American Chamber of Commerce",
    "Algerian American business",
    "Algeria USA trade",
    "Algerian diaspora USA",
    "Algeria investment opportunities",
    "Algerian entrepreneurs in America",
    "US Algeria business council",
    "Algerian American business directory",
    "Algeria US trade mission",
    "Algerian American community",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aaccusa.org",
    siteName: "AACC-USA",
    title: "AACC-USA | Algerian American Chamber of Commerce USA",
    description:
      "Building the Bridge Between Algerian Talent, Trade, and Opportunity.",
    images: [{ url: "/aacc-logo.png", width: 580, height: 335 }],
  },
  icons: {
    icon: "/aacc-logo.png",
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
      className={`${inter.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
