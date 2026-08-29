"use client";

import Link from "@/components/ui/LocalizedLink";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";
const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000; // 180 days
const TRANSITION_MS = 300;

type StoredConsent = { value: "accepted" | "rejected"; ts: number };

export default function CookieConsentBanner() {
  const { lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: StoredConsent | null = raw ? JSON.parse(raw) : null;
      const isStale = !stored || Date.now() - stored.ts > CONSENT_MAX_AGE_MS;
      if (!isStale) return;
    } catch {
      // fall through and show the banner
    }

    setMounted(true);
    // Mount off-screen first, then flip to the visible state. A single rAF
    // can fire before the hidden state has actually painted, so the browser
    // coalesces both style changes into one frame and skips the transition —
    // nesting two rAFs guarantees a paint happens in between.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const respond = (value: StoredConsent["value"]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, ts: Date.now() }),
      );
    } catch {
      // localStorage unavailable (private mode, etc.) — banner just won't be remembered.
    }
    setShown(false);
    setTimeout(() => setMounted(false), TRANSITION_MS);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-x-4 z-[60] bottom-[calc(3.75rem+env(safe-area-inset-bottom)+0.75rem)] mx-auto max-w-2xl transition-all duration-300 ease-out lg:bottom-4 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      role="dialog"
      aria-label={t(lang, "cookieConsent.message")}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/35 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {t(lang, "cookieConsent.message")}{" "}
          <Link
            href="/privacy#cookies"
            className="font-medium text-[#2c6e9b] underline hover:no-underline"
          >
            {t(lang, "cookieConsent.learnMore")}
          </Link>
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => respond("rejected")}
            className="cursor-pointer rounded-xl border border-gray-400 bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition-all duration-300 hover:bg-gray-50/20"
          >
            {t(lang, "cookieConsent.reject")}
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="cursor-pointer rounded-xl bg-[#2c6e9b] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
          >
            {t(lang, "cookieConsent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
