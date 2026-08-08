import {
  MapIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

const items = [
  {
    icon: MapIcon,
    title: "Handpicked Locations",
    subtitle: "Curated by locals who know Porto best",
  },
  {
    icon: SparklesIcon,
    title: "AI Trip Planning",
    subtitle: "Turn any attraction into a full itinerary",
  },
  {
    icon: BuildingStorefrontIcon,
    title: "Nearby Recommendations",
    subtitle: "Trusted hotels & restaurants close by",
  },
  {
    icon: HeartIcon,
    title: "Free to Explore",
    subtitle: "No booking required to discover Porto",
  },
];

export default function AttractionsInfoStrip() {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <item.icon className="h-6 w-6 flex-shrink-0 text-[#2c6e9b]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {item.title}
            </p>
            <p className="text-xs text-gray-500">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
