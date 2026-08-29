import { Cormorant_Garamond, Manrope, Righteous } from "next/font/google";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import ConditionalFooter from "@/components/layout/ConditionalFooter";
import ConnectivityBanner from "@/components/layout/ConnectivityBanner";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { locales } from "@/i18n";
import AuthProvider from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { MobileMenuProvider } from "@/providers/MobileMenuProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});

const SITE_TITLE = "GoWithPorto — Plan Your Perfect Porto Trip with AI";
const SITE_DESCRIPTION =
  "AI-powered itineraries, curated souvenirs, local experiences, and top attractions in Porto, Portugal. Plan your perfect trip with GoWithPorto.";

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const canonicalPath = hdrs.get("x-canonical-path") || "/";
  const locale = hdrs.get("x-locale") || "en";
  const suffix = canonicalPath === "/" ? "" : canonicalPath;

  const languages: Record<string, string> = {
    "x-default": `${BASE_URL}${suffix}`,
  };
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}${suffix}` : `${BASE_URL}/${l}${suffix}`;
  }

  const ogLocale = locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US";

  return {
    metadataBase: new URL(BASE_URL),
    title: { default: SITE_TITLE, template: "%s | GoWithPorto" },
    description: SITE_DESCRIPTION,
    alternates: { languages },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: `${BASE_URL}${suffix}`,
      siteName: "GoWithPorto",
      images: ["/logo.png"],
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ["/logo.png"],
    },
  };
}

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "GoWithPorto",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  telephone: "+351927727202",
  priceRange: "€€",
  areaServed: [
    { "@type": "City", name: "Porto" },
    { "@type": "City", name: "Vila Nova de Gaia" },
    { "@type": "City", name: "Matosinhos" },
    { "@type": "City", name: "Póvoa de Varzim" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Porto",
    addressCountry: "PT",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const locale = hdrs.get("x-locale") || "en";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} ${righteous.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <AuthProvider>
          <ReduxProvider>
            <LanguageProvider>
            <MobileMenuProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: "0.75rem",
                    background: "var(--bg)",
                    color: "var(--text)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  },
                  success: { iconTheme: { primary: "#2c6e9b", secondary: "#fff" } },
                }}
              />
              <ConnectivityBanner />
              <Header />
              {children}
              <ConditionalFooter />

              {/* Reserves scroll space so the fixed mobile bottom nav never covers page content */}
              <div
                className="lg:hidden"
                style={{ height: "calc(3.75rem + env(safe-area-inset-bottom))" }}
                aria-hidden
              />
              <MobileBottomNav />
            </MobileMenuProvider>
            </LanguageProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
