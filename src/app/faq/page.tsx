"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { ChevronDownIcon, LifebuoyIcon } from "@heroicons/react/24/outline";
import Link from "@/components/ui/LocalizedLink";
import { useState } from "react";

interface FaqItem {
  key: string;
}

interface FaqCategory {
  titleKey: string;
  items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
  {
    titleKey: "faq.category.gettingStarted",
    items: [{ key: "gs1" }, { key: "gs2" }, { key: "gs3" }, { key: "gs4" }, { key: "gs5" }],
  },
  {
    titleKey: "faq.category.ordersPayments",
    items: [{ key: "op1" }, { key: "op2" }, { key: "op3" }, { key: "op4" }],
  },
  {
    titleKey: "faq.category.marketplace",
    items: [{ key: "mk1" }, { key: "mk2" }, { key: "mk3" }],
  },
  {
    titleKey: "faq.category.bikeRentals",
    items: [{ key: "bk1" }, { key: "bk2" }],
  },
  {
    titleKey: "faq.category.accountPrivacy",
    items: [{ key: "ap1" }, { key: "ap2" }, { key: "ap3" }],
  },
];

function FaqRow({ lang, itemKey }: { lang: string; itemKey: string }) {
  const [open, setOpen] = useState(false);
  const question = t(lang, `faq.q.${itemKey}.q`);
  const answer = t(lang, `faq.q.${itemKey}.a`);

  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-[#1d3d5c]">{question}</span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-[#2c6e9b] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <p className="min-h-0 text-sm leading-relaxed text-[var(--text)]">{answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-12 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <LifebuoyIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          {t(lang, "faq.hero.title")}
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-[var(--text)]">
          {t(lang, "faq.hero.subtitlePre")}{" "}
          <Link href="/contact" className="font-medium text-[#2c6e9b] underline hover:no-underline">
            {t(lang, "faq.hero.subtitleLink")}
          </Link>
          .
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        {CATEGORIES.map((category) => (
          <div
            key={category.titleKey}
            className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8"
          >
            <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">
              {t(lang, category.titleKey)}
            </h2>
            <div className="mt-2">
              {category.items.map((item) => (
                <FaqRow key={item.key} lang={lang} itemKey={item.key} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
