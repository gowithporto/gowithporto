import {
  CubeIcon,
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const items = [
  {
    icon: CubeIcon,
    title: "Secure Packaging",
    subtitle: "Your items are packed with care",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safe & Secure",
    subtitle: "Trusted checkout guaranteed",
  },
  {
    icon: TruckIcon,
    title: "Fast Delivery",
    subtitle: "Quick delivery across Portugal & beyond",
  },
  {
    icon: HeartIcon,
    title: "Made with Love",
    subtitle: "Supporting local artisans and traditions",
  },
];

export default function InfoStrip() {
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
