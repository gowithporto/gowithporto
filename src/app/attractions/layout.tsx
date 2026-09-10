import { locales } from "@/i18n";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

const languages: Record<string, string> = {};
for (const l of locales) {
  languages[l] = l === "en" ? `${BASE_URL}/attractions` : `${BASE_URL}/${l}/attractions`;
}

export const metadata: Metadata = {
  title: "Top Attractions in Porto",
  description:
    "Discover Porto's best attractions — historic landmarks, viewpoints, and must-see sights, with opening hours, entry fees, and insider tips.",
  alternates: { languages },
};

export default function AttractionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
