import { Cormorant_Garamond, Manrope, Righteous } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Header from "@/components/layout/Header";
import AuthProvider from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import ThemeProvider from "@/providers/ThemeProvider";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} ${righteous.variable}`}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ReduxProvider>
              <LanguageProvider>
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
                <Header />
                {children}
                <ConditionalFooter />
              </LanguageProvider>
            </ReduxProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
