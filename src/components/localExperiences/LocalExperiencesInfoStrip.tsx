import {
  ClockIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const items = [
  {
    icon: HeartIcon,
    title: "Local & Authentic",
    subtitle: "Curated by locals who know Porto best",
  },
  {
    icon: ShieldCheckIcon,
    title: "Trusted Experiences",
    subtitle: "Carefully selected for quality and authenticity",
  },
  {
    icon: UserGroupIcon,
    title: "Small Groups",
    subtitle: "Enjoy intimate experiences with a personal touch",
  },
  {
    icon: ClockIcon,
    title: "Free Cancellation",
    subtitle: "Cancel up to 24h before your experience",
  },
];

export default function LocalExperiencesInfoStrip() {
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
