import Image from "next/image";

import historic from "@/assets/1. home page/discover_porto/1.png";
import romantic from "@/assets/1. home page/discover_porto/9.png";
import adventure from "@/assets/1. home page/discover_porto/4.png";
import foodie from "@/assets/1. home page/local flavor of porto/6.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "@/components/home/Carousel";

const inspirations = [
  {
    image: historic,
    title: "Historic Porto",
    subtitle: "Culture, landmarks & timeless charm",
  },
  {
    image: foodie,
    title: "Foodie Escape",
    subtitle: "Taste the best of Porto",
  },
  {
    image: adventure,
    title: "Adventure Vibes",
    subtitle: "Nature, ocean & adrenaline",
  },
  {
    image: romantic,
    title: "Romantic Getaway",
    subtitle: "Perfect moments for two",
  },
];

export default function AIInspiredCarousel() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        Get inspired by what&apos;s possible
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-56 sm:w-64">
          {inspirations.map((item) => (
            <div key={item.title}>
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="h-44 w-full object-cover transition duration-300 hover:scale-105 sm:h-52"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
