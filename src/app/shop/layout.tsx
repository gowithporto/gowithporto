import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Porto Souvenirs",
  description:
    "Browse authentic Porto souvenirs and local products from independent sellers, delivered to your door or picked up in the city.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
