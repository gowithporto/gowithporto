import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trip Planner",
  description:
    "Generate a personalized Porto itinerary in seconds with GoWithPorto's AI trip planner, tailored to your budget, travel style, and interests.",
};

export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
