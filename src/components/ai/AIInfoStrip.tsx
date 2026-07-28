import { FaBookOpen, FaClock, FaHeart, FaMagic } from "react-icons/fa";

const items = [
  {
    icon: FaMagic,
    title: "AI-Powered",
    subtitle: "Smart recommendations tailored to you.",
  },
  {
    icon: FaBookOpen,
    title: "Local Expertise",
    subtitle: "Curated by Porto locals who know best.",
  },
  {
    icon: FaClock,
    title: "Save Time",
    subtitle: "Get a complete itinerary in seconds.",
  },
  {
    icon: FaHeart,
    title: "Made for You",
    subtitle: "Unique experiences that match your style.",
  },
];

export default function AIInfoStrip() {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/5 bg-[#f4f7fa] p-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
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
