"use client";

import Button from "@/components/ui/Button";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import { useEffect, useState } from "react";

import Link from "next/link";
import backgroundImage from "../assets/HERO BG.png";
import bottomLeftLine1 from "../assets/bottom left line 1.png";
import bottomRightLine1 from "../assets/bottom right line 1.png";

export default function Home() {
  const [show, setShow] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative flex min-h-screen items-center px-[10%]">
        {/* Background */}
        <Image
          src={backgroundImage}
          alt="Porto Hero"
          fill
          priority
          className="object-cover"
        />

        {/* Content */}
        <div
          className={`relative z-10 max-w-xl transition-all duration-1000
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h1
            className="font-serif text-[clamp(2.5rem,6vw,4rem)] text-[var(--primary)]
 leading-tight"
          >
            {t(lang, "home.title")}{" "}
            <span className="text-[#eab657]">{t(lang, "home.withai")}</span>
          </h1>

          <p className="mt-5 text-lg text-[var(--text)]">
            {t(lang, "home.subtitle")}
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/ai">
              <Button className="cursor-pointer">{t(lang, "home.cta")}</Button>
            </Link>
            <Link href="/shop">
              <Button
                className="cursor-pointer text-[var(--text)]"
                variant="secondary"
              >
                {t(lang, "home.explore")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Azulejo */}
        <Image
          src={bottomLeftLine1}
          alt=""
          width={300}
          height={80}
          className="absolute bottom-16 left-0 hidden lg:block"
        />
        <Image
          src={bottomRightLine1}
          alt=""
          width={300}
          height={80}
          className="absolute bottom-16 right-0 hidden lg:block"
        />
      </section>
    </main>
  );
}
