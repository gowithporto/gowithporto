import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Attractions in Porto",
  description:
    "Discover Porto's best attractions — historic landmarks, viewpoints, and must-see sights, with opening hours, entry fees, and insider tips.",
};

export default function AttractionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
