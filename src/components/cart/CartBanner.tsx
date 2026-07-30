import Image from "next/image";

import banner from "@/assets/3. cart page/banner galo ad cart page.png";

export default function CartBanner() {
  return (
    <div className="overflow-hidden rounded-2xl">
      <Image
        src={banner}
        alt="A piece of Porto, just for you — thank you for supporting local artisans"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}
