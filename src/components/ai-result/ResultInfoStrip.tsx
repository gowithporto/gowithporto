import {
  FaBookOpen,
  FaCertificate,
  FaMagic,
  FaShieldAlt,
} from "react-icons/fa";

const items = [
  {
    icon: FaMagic,
    title: "AI-Powered Itinerary",
    subtitle: "Custom plan crafted just for you",
  },
  {
    icon: FaBookOpen,
    title: "Local Experts",
    subtitle: "Curated by Porto locals who know best",
  },
  {
    icon: FaShieldAlt,
    title: "Trusted & Secure",
    subtitle: "Your data is safe and private",
  },
  {
    icon: FaCertificate,
    title: "Officially Inspired",
    subtitle: "Content aligned with Visit Porto guidelines",
  },
];

export default function ResultInfoStrip() {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/5 bg-[#f9fafb] p-6 sm:grid-cols-4">
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
