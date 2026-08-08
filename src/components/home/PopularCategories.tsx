import Image from "next/image";
import Link from "next/link";

import bicycle from "@/assets/1. home page/popular_categories/bycycle.png";
import coffeeCup from "@/assets/1. home page/popular_categories/caffeCup.png";
import camera from "@/assets/1. home page/popular_categories/camera.png";
import map from "@/assets/1. home page/popular_categories/map.png";
import shoppingBag from "@/assets/1. home page/popular_categories/shoopingBag.png";
import centerLine from "@/assets/center line 3.png";

const categories = [
  {
    icon: camera,
    title: "AI Trip Planner",
    subtitle: "Smart itineraries tailored for you",
    href: "/ai",
  },
  {
    icon: shoppingBag,
    title: "Souvenir Shop",
    subtitle: "Authentic Porto souvenirs & gifts",
    href: "/shop",
  },
  {
    icon: map,
    title: "Top Attractions",
    subtitle: "Explore the best places in Porto",
    href: "/attractions",
  },
  {
    icon: bicycle,
    title: "Bike Rentals",
    subtitle: "Ride around Porto at your pace",
    href: "#bike-rental",
  },
  {
    icon: coffeeCup,
    title: "Local Experiences",
    subtitle: "Food, wine & culture like a local",
    href: "#local-flavors",
  },
];

export default function PopularCategories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-center font-serif text-3xl text-[var(--primary)]">
        Popular Categories
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-5 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group flex flex-col items-center gap-3 text-center transition hover:-translate-y-1"
          >
            <Image
              src={cat.icon}
              alt=""
              width={72}
              height={72}
              className="h-32 w-32 object-contain"
            />
            <div>
              <p className="font-medium text-[var(--text)]">{cat.title}</p>
              <p className="mt-1 text-xs text-[var(--text)]/60">
                {cat.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
