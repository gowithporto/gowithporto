"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

import lighthouse from "@/assets/1. home page/why choose & stay inspired/why choose gowithporto.png";
import grapevine from "@/assets/1. home page/why choose & stay inspired/stay inspired.png";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const REASON_KEYS = [
  "home.whyChoose.reason1",
  "home.whyChoose.reason2",
  "home.whyChoose.reason3",
  "home.whyChoose.reason4",
];

export default function WhyChooseStayInspired() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <Image
            src={lighthouse}
            alt=""
            className="pointer-events-none absolute -right-6 bottom-0 z-0 h-32 w-auto object-contain opacity-80 sm:h-40"
          />
          <div className="relative z-10 sm:max-w-[65%]">
            <h3 className="font-serif text-2xl font-medium text-[var(--primary)]">
              {t(lang, "home.whyChoose.heading")}
            </h3>
            <ul className="mt-5 space-y-3">
              {REASON_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-[#4b5b66]">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  {t(lang, key)}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <Image
            src={grapevine}
            alt=""
            className="pointer-events-none absolute -right-4 -top-4 z-0 h-28 w-auto object-contain opacity-80 sm:h-36"
          />
          <div className="relative z-10">
            <h3 className="font-serif text-2xl font-medium text-[var(--primary)]">
              {t(lang, "home.stayInspired.heading")}
            </h3>
            <p className="mt-3 max-w-xs text-sm text-[#4b5b66]">
              {t(lang, "home.stayInspired.subtitle")}
            </p>

            {subscribed ? (
              <p className="mt-5 text-sm font-medium text-[var(--primary)]">
                {t(lang, "home.stayInspired.thanks")}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-5 flex max-w-sm gap-2">
                <Input
                  type="email"
                  required
                  placeholder={t(lang, "home.stayInspired.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90"
                />
                <Button type="submit" className="shrink-0 cursor-pointer">
                  {t(lang, "home.stayInspired.subscribe")}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
