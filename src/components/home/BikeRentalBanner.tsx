import Image from "next/image";
import Link from "next/link";

import bikeBanner from "@/assets/1. home page/rent bike banner section photo.png";
import Button from "@/components/ui/Button";

export default function BikeRentalBanner() {
  return (
    <section id="bike-rental" className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={bikeBanner}
          alt="Rent a bike and explore Porto"
          className="h-56 w-full object-cover sm:h-80"
          priority={false}
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-white/90 via-white/60 to-transparent">
          <div className="max-w-sm px-6 sm:px-12">
            <h3 className="font-serif text-2xl font-medium text-[var(--primary)] sm:text-3xl">
              Rent a Bike &amp; Explore Porto Freely
            </h3>
            <p className="mt-3 text-sm text-[#4b5b66] sm:text-base">
              Enjoy the city&apos;s beauty on two wheels. Easy, fun and
              eco-friendly.
            </p>
            <Link href="/bike-rentals" className="mt-5 inline-block">
              <Button className="cursor-pointer">Find Bike Rentals</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
