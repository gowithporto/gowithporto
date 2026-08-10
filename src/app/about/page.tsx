import Button from "@/components/ui/Button";
import {
  GlobeAltIcon,
  HeartIcon,
  MapIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const OFFERINGS = [
  {
    icon: SparklesIcon,
    title: "AI Trip Planner",
    description:
      "Tell us your dates, interests, and pace — our AI puts together a personalized Porto itinerary in moments, ready to save and follow.",
  },
  {
    icon: MapIcon,
    title: "Attractions & Local Experiences",
    description:
      "From the Dom Luís I Bridge to hidden viewpoints, discover the landmarks and local experiences that make Porto worth exploring on foot.",
  },
  {
    icon: ShoppingBagIcon,
    title: "Souvenir Marketplace",
    description:
      "Authentic finds from independent Porto shops and makers, delivered to your door — every purchase supports a local business directly.",
  },
  {
    icon: GlobeAltIcon,
    title: "Bike Rentals",
    description:
      "Book a bike and see the city at your own pace, with pickup and return handled by local rental partners.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      {/* HERO */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <HeartIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          About GoWithPorto
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-[var(--text)]">
          A Porto-based project built by people who love this city, made to help travelers
          experience it the way locals do.
        </p>
      </div>

      {/* OUR STORY */}
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
        <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">Our Story</h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          GoWithPorto started with a simple frustration: planning a trip to Porto usually means
          juggling a dozen tabs — blog posts, review sites, booking platforms — just to figure
          out what to see and where to buy something genuinely local. We built GoWithPorto to
          bring that all into one place, powered by a bit of AI and a lot of local knowledge.
        </p>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          We&apos;re based in Porto, Portugal, and we&apos;re still a small, independent team — which
          means every shop in our marketplace and every recommendation on the platform is
          chosen with care, not mass-listed.
        </p>
      </div>

      {/* MISSION */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">Our Mission</h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          To make planning a Porto trip effortless, and to give independent local businesses —
          shops, guides, rental partners — a genuine way to reach the travelers who&apos;d love to
          find them.
        </p>
      </div>

      {/* WHAT WE OFFER */}
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-xl font-medium text-[#1d3d5c]">
          What We Offer
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-black/5 bg-white/80 p-6 text-center shadow-sm backdrop-blur"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-base font-medium text-[#1d3d5c]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">
          Have a question, or want to partner with us?
        </h2>
        <p className="text-sm text-[var(--text)]">
          Whether you&apos;re planning a trip or you run a shop in Porto, we&apos;d love to hear from you.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/ai">
            <Button className="cursor-pointer">Plan My Trip</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="cursor-pointer">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
