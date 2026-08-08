import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bike Rentals in Porto",
  description:
    "Discover trusted local bike rental shops around Porto — find one near you and open its location on Google Maps.",
};

export default function BikeRentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
