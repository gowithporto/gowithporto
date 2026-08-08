import Image from "next/image";

import banner from "@/assets/4. Ai input page/banner ai input.png";
import centerLine from "@/assets/center line 3.png";

export default function AIPlannerHero() {
  return (
    <div className="flex flex-col">
      <div className="font-accent text-xs tracking-[0.15em] text-[var(--primary)] uppercase">
        AI Travel Planner
      </div>

      <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-[#173d5c] sm:text-5xl">
        Your perfect Porto trip,{" "}
        <span className="text-[#4d8fc7]">made just for you</span>
      </h1>

      <Image src={centerLine} alt="" className="mt-3 h-auto w-64" />

      <p className="mt-5 max-w-md text-[15px] text-[#4b5b66]">
        Tell us your travel style and let our AI craft a personalized
        itinerary with the best places, local experiences and hidden gems.
      </p>

      <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-sm sm:aspect-auto sm:min-h-[340px] sm:flex-1">
        <Image
          src={banner}
          alt="Porto riverside skyline"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
