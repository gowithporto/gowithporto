import Image from "next/image";
import Link from "next/link";

import galoAd from "@/assets/2. shop page/galo ad.png";

export default function ShopAdCard() {
  return (
    <Link
      href="/"
      className="block overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
    >
      <Image
        src={galoAd}
        alt="A piece of Porto, just for you"
        className="h-auto w-full"
      />
    </Link>
  );
}
