"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { FaBookOpen, FaClock, FaHeart, FaMagic } from "react-icons/fa";

const ITEMS = [
  { icon: FaMagic, titleKey: "ai.info.powered.title", subtitleKey: "ai.info.powered.subtitle" },
  { icon: FaBookOpen, titleKey: "ai.info.expertise.title", subtitleKey: "ai.info.expertise.subtitle" },
  { icon: FaClock, titleKey: "ai.info.time.title", subtitleKey: "ai.info.time.subtitle" },
  { icon: FaHeart, titleKey: "ai.info.made.title", subtitleKey: "ai.info.made.subtitle" },
];

export default function AIInfoStrip() {
  const { lang } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/5 bg-[#f4f7fa] p-6 sm:grid-cols-4">
      {ITEMS.map((item) => (
        <div key={item.titleKey} className="flex items-start gap-3">
          <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              {t(lang, item.titleKey)}
            </p>
            <p className="text-xs text-gray-500">{t(lang, item.subtitleKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
