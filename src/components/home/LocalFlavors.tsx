import Image from "next/image";

import img1 from "@/assets/1. home page/local flavor of porto/1.png";
import img10 from "@/assets/1. home page/local flavor of porto/10.png";
import img11 from "@/assets/1. home page/local flavor of porto/11.png";
import img12 from "@/assets/1. home page/local flavor of porto/12.png";
import img2 from "@/assets/1. home page/local flavor of porto/2.png";
import img3 from "@/assets/1. home page/local flavor of porto/3.png";
import img4 from "@/assets/1. home page/local flavor of porto/4.png";
import img5 from "@/assets/1. home page/local flavor of porto/5.png";
import img6 from "@/assets/1. home page/local flavor of porto/6.png";
import img7 from "@/assets/1. home page/local flavor of porto/7.png";
import img8 from "@/assets/1. home page/local flavor of porto/8.png";
import img9 from "@/assets/1. home page/local flavor of porto/9.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "./Carousel";

const flavors = [
  { image: img1, caption: "Francesinha" },
  { image: img2, caption: "Octopus Stew" },
  { image: img3, caption: "Pastéis de Nata" },
  { image: img4, caption: "Grilled Fish" },
  { image: img5, caption: "Local Cheeses" },
  { image: img6, caption: "Port Wine" },
  { image: img7, caption: "Petiscos" },
  { image: img8, caption: "Fresh Seafood" },
  { image: img9, caption: "Traditional Bakery" },
  { image: img10, caption: "Wine Tasting" },
  { image: img11, caption: "Market Produce" },
  { image: img12, caption: "Café Culture" },
];

export default function LocalFlavors() {
  return (
    <section
      id="local-flavors"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10"
    >
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        Local Flavors of Porto
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-36 sm:w-44">
          {flavors.map((flavor, i) => (
            <div key={i} className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={flavor.image}
                alt={flavor.caption}
                className="h-40 w-full object-cover transition duration-300 hover:scale-105 sm:h-48"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
