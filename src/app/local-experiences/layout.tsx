import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Experiences & Tours in Porto",
  description:
    "Book curated local experiences and tours in Porto — food, wine, history, and adventure activities led by local experts.",
};

export default function LocalExperiencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
