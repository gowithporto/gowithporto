import Image from "next/image";

import img1 from "@/assets/1. home page/discover_porto/1.png";
import img10 from "@/assets/1. home page/discover_porto/10.png";
import img2 from "@/assets/1. home page/discover_porto/2.png";
import img3 from "@/assets/1. home page/discover_porto/3.png";
import img4 from "@/assets/1. home page/discover_porto/4.png";
import img5 from "@/assets/1. home page/discover_porto/5.png";
import img6 from "@/assets/1. home page/discover_porto/6.png";
import img7 from "@/assets/1. home page/discover_porto/7.png";
import img8 from "@/assets/1. home page/discover_porto/8.png";
import img9 from "@/assets/1. home page/discover_porto/9.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "./Carousel";

const places = [
  { image: img1, caption: "Ribeira Riverside" },
  { image: img2, caption: "Clérigos Tower" },
  { image: img3, caption: "Igreja do Carmo" },
  { image: img4, caption: "Porto Beaches" },
  { image: img5, caption: "Dom Luís Bridge" },
  { image: img6, caption: "Historic Streets" },
  { image: img7, caption: "Riverside Views" },
  { image: img8, caption: "City Landmarks" },
  { image: img9, caption: "Porto Wine Cellars" },
  { image: img10, caption: "Scenic Porto" },
];

export default function DiscoverPorto() {
  return (
    <section
      id="discover-porto"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10"
    >
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        Discover Porto
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-40 sm:w-48">
          {places.map((place, i) => (
            <div key={i} className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={place.image}
                alt={place.caption}
                className="h-56 w-full object-cover transition duration-300 hover:scale-105 sm:h-64"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
