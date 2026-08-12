"use client";

import Button from "@/components/ui/Button";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import bottomLeftLine1 from "../assets/bottom left line 1.png";
import bottomRightLine1 from "../assets/bottom right line 1.png";
import topLeftLine1 from "../assets/top left line 1.png";
import topRightLine1 from "../assets/top right line 1.png";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [show, setShow] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-4 pt-24 pb-20 sm:px-8 lg:px-12">
      <Image
        src={topLeftLine1}
        alt=""
        width={300}
        height={80}
        className="absolute top-0 left-0 h-auto w-28 rotate-180 opacity-60 sm:w-40 lg:w-75"
      />
      <Image
        src={topRightLine1}
        alt=""
        width={300}
        height={80}
        className="absolute top-0 right-0 h-auto w-28 rotate-180 opacity-60 sm:w-40 lg:w-75"
      />
      <Image
        src={bottomLeftLine1}
        alt=""
        width={300}
        height={80}
        className="absolute bottom-0 left-0 h-auto w-28 sm:w-40 lg:w-75"
      />
      <Image
        src={bottomRightLine1}
        alt=""
        width={300}
        height={80}
        className="absolute bottom-0 right-0 h-auto w-28 sm:w-40 lg:w-75"
      />

      <div
        className={`relative z-10 mx-auto max-w-xl text-center transition-all duration-1000
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eab657]/10 text-[#eab657]">
          <ExclamationTriangleIcon className="h-8 w-8" />
        </div>

        <h1 className="mt-3 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-medium text-[var(--primary)]">
          {t(lang, "error.title")}
        </h1>

        <div className="mx-auto mt-4 h-[2px] w-16 bg-[#2c6e9b]/40" />

        <p className="mt-5 text-[var(--text)]">{t(lang, "error.subtitle")}</p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            onClick={() => reset()}
            className="w-full cursor-pointer whitespace-nowrap sm:w-auto"
          >
            {t(lang, "error.cta.retry")}
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full cursor-pointer whitespace-nowrap text-[var(--text)] sm:w-auto"
              variant="secondary"
            >
              {t(lang, "error.cta.home")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
