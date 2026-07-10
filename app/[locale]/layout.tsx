import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Manrope, Noto_Sans_Arabic } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { locales, isLocale, dir, getDictionary, type Locale } from "@/lib/i18n";
import "../globals.css";

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

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return {
    metadataBase: new URL("https://aaccusa.org"),
    title: {
      default: dict.meta.siteTitle,
      template: "%s | AACC-USA",
    },
    description: dict.meta.siteDescription,
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
      locale: locale === "ar" ? "ar_DZ" : "en_US",
      url: `https://aaccusa.org/${locale}`,
      siteName: "AACC-USA",
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "AACC-USA — Algerian American Chamber of Commerce | غرفة التجارة الجزائرية الأمريكية بالولايات المتحدة",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      images: ["/og-image.jpg"],
    },
    icons: {
      icon: "/aacc-logo.png",
    },
    alternates: {
      languages: {
        en: "https://aaccusa.org/en",
        ar: "https://aaccusa.org/ar",
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <html
      lang={locale}
      dir={dir(locale as Locale)}
      className={`${inter.variable} ${manrope.variable} ${notoArabic.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans">
        <Header locale={locale as Locale} nav={dict.nav} />
        <main>{children}</main>
        <Footer locale={locale as Locale} dict={dict} />
      </body>
    </html>
  );
}
