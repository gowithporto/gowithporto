import { locales } from "@/i18n";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

const languages: Record<string, string> = {};
for (const l of locales) {
  languages[l] = l === "en" ? `${BASE_URL}/local-experiences` : `${BASE_URL}/${l}/local-experiences`;
}

export const metadata: Metadata = {
  title: "Local Experiences & Tours in Porto",
  description:
    "Book curated local experiences and tours in Porto — food, wine, history, and adventure activities led by local experts.",
  alternates: { languages },
};

export default function LocalExperiencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
