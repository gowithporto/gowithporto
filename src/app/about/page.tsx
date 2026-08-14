import Button from "@/components/ui/Button";
import { t } from "@/i18n";
import {
  GlobeAltIcon,
  HeartIcon,
  MapIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { headers } from "next/headers";
import Link from "@/components/ui/LocalizedLink";

export default async function AboutPage() {
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";

  const OFFERINGS = [
    {
      icon: SparklesIcon,
      title: t(lang, "about.offer.ai.title"),
      description: t(lang, "about.offer.ai.description"),
    },
    {
      icon: MapIcon,
      title: t(lang, "about.offer.attractions.title"),
      description: t(lang, "about.offer.attractions.description"),
    },
    {
      icon: ShoppingBagIcon,
      title: t(lang, "about.offer.shop.title"),
      description: t(lang, "about.offer.shop.description"),
    },
    {
      icon: GlobeAltIcon,
      title: t(lang, "about.offer.bikes.title"),
      description: t(lang, "about.offer.bikes.description"),
    },
  ];

  return (
    <div className="space-y-16 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      {/* HERO */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <HeartIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          {t(lang, "about.hero.title")}
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-[var(--text)]">{t(lang, "about.hero.subtitle")}</p>
      </div>

      {/* OUR STORY */}
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
        <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">
          {t(lang, "about.story.title")}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {t(lang, "about.story.p1")}
        </p>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {t(lang, "about.story.p2")}
        </p>
      </div>

      {/* MISSION */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">
          {t(lang, "about.mission.title")}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {t(lang, "about.mission.p1")}
        </p>
      </div>

      {/* WHAT WE OFFER */}
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-xl font-medium text-[#1d3d5c]">
          {t(lang, "about.offer.title")}
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
          {t(lang, "about.cta.title")}
        </h2>
        <p className="text-sm text-[var(--text)]">{t(lang, "about.cta.subtitle")}</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/ai">
            <Button className="cursor-pointer">{t(lang, "about.cta.plan")}</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="cursor-pointer">
              {t(lang, "about.cta.contact")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
