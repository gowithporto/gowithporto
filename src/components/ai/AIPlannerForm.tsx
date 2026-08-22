"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaCoins,
  FaHiking,
  FaLandmark,
  FaLock,
  FaMagic,
  FaMapMarkerAlt,
  FaMoon,
  FaShoppingBag,
  FaSpa,
  FaUsers,
  FaWineGlassAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";

const DAY_OPTIONS = Array.from({ length: 14 }, (_, i) => String(i + 1));

// `value` is what's actually submitted (and interpolated straight into the AI
// prompt by promptBuilder.ts) — it must stay a stable English identifier regardless
// of UI language. Only `labelKey` (the on-screen text) is translated.
const TRAVEL_STYLES = [
  { value: "Culture & History", labelKey: "ai.form.style.culture", icon: FaLandmark },
  { value: "Food & Wine", labelKey: "ai.form.style.food", icon: FaWineGlassAlt },
  { value: "Adventure", labelKey: "ai.form.style.adventure", icon: FaHiking },
  { value: "Relaxation", labelKey: "ai.form.style.relaxation", icon: FaSpa },
  { value: "Nightlife", labelKey: "ai.form.style.nightlife", icon: FaMoon },
  { value: "Shopping", labelKey: "ai.form.style.shopping", icon: FaShoppingBag },
];

const BUDGET_OPTIONS = [
  { value: "Cheap", labelKey: "ai.form.budget.cheap" },
  { value: "Medium", labelKey: "ai.form.budget.medium" },
  { value: "Luxury", labelKey: "ai.form.budget.luxury" },
];

const GROUP_OPTIONS = [
  { value: "Solo", labelKey: "ai.form.group.solo" },
  { value: "Couple", labelKey: "ai.form.group.couple" },
  { value: "Family", labelKey: "ai.form.group.family" },
  { value: "Friends", labelKey: "ai.form.group.friends" },
];

const fieldClass =
  "w-full appearance-none rounded-xl border border-black/10 bg-white py-3 pl-9 pr-9 text-sm text-[var(--text)] outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20";

export default function AIPlannerForm() {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    days: "3",
    dates: "",
    budget: "",
    people: "",
    travelStyles: ["Culture & History"] as string[],
    interests: "",
  });

  const isFormValid = form.days && form.budget && form.people;

  const toggleStyle = (value: string) => {
    setForm((f) => ({
      ...f,
      travelStyles: f.travelStyles.includes(value)
        ? f.travelStyles.filter((s) => s !== value)
        : [...f.travelStyles, value],
    }));
  };

  async function handlePayment() {
    const res = await fetch("/api/payments/ai-credits", {
      method: "POST",
    });

    if (!res.ok) {
      toast.error(t(lang, "ai.form.paymentError"));
      setLoading(false);
      return;
    }

    const data = await res.json();
    window.location.href = data.url;
  }

  async function handleSubmit() {
    if (!session) {
      toast.custom(
        (tst) => (
          <div
            className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-lg transition-all duration-300"
            style={{
              maxWidth: 360,
              opacity: tst.visible ? 1 : 0,
              transform: tst.visible ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
              <FaLock className="text-sm" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                {t(lang, "ai.form.loginRequiredTitle")}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {t(lang, "ai.form.loginRequiredBody")}
              </p>
            </div>
          </div>
        ),
        { duration: 2200 },
      );

      setTimeout(() => {
        signIn("google");
      }, 2200);
      return;
    }

    if (!isFormValid) return;

    setLoading(true);

    try {
      const res = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: form.days,
          budget: form.budget,
          people: form.people,
          dates: form.dates,
          travelStyles: form.travelStyles,
          interests: form.interests,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || t(lang, "ai.form.genericError"));
        setLoading(false);
        return;
      }

      if (data.locked) {
        await handlePayment();
        return;
      }

      if (data.id) {
        window.location.assign(`/ai/result?id=${data.id}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error(error);
      toast.error(t(lang, "ai.form.somethingWrong"));
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-[var(--primary)]">
        <h2 className="font-serif text-xl font-medium sm:text-2xl">
          {t(lang, "ai.form.heading")}
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-gray-500">
        {t(lang, "ai.form.subheading")}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            {t(lang, "ai.form.destination")}
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value="Porto, Portugal"
              disabled
              className="w-full rounded-xl border border-black/10 bg-gray-50 py-3 pl-9 pr-4 text-sm text-[var(--text)] outline-none"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-black/60">
              {t(lang, "ai.form.days")}
            </label>
            <div className="relative">
              <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
                className={fieldClass}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            </div>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-black/60">
              {t(lang, "ai.form.dates")}
            </label>
            <div className="relative">
              <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={form.dates}
                onChange={(e) => setForm({ ...form, dates: e.target.value })}
                className="w-full min-w-0 appearance-none rounded-xl border border-black/10 bg-white py-3 pl-9 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-gray-400 focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            {t(lang, "ai.form.budget")}
          </label>
          <div className="relative">
            <FaCoins className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className={fieldClass}
            >
              <option value="" disabled>
                {t(lang, "ai.form.budgetPlaceholder")}
              </option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(lang, opt.labelKey)}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            {t(lang, "ai.form.group")}
          </label>
          <div className="relative">
            <FaUsers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={form.people}
              onChange={(e) => setForm({ ...form, people: e.target.value })}
              className={fieldClass}
            >
              <option value="" disabled>
                {t(lang, "ai.form.groupPlaceholder")}
              </option>
              {GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(lang, opt.labelKey)}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black/60">
            {t(lang, "ai.form.travelStyle")}
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map(({ value, labelKey, icon: Icon }) => {
              const selected = form.travelStyles.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStyle(value)}
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                    selected
                      ? "border-[#2c6e9b] bg-[#2c6e9b]/5 text-[#2c6e9b]"
                      : "border-black/10 text-gray-600 hover:border-black/20"
                  }`}
                >
                  <Icon className={selected ? "text-[#2c6e9b]" : "text-gray-400"} />
                  {t(lang, labelKey)}
                  {selected && (
                    <FaCheckCircle className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-white text-[#2c6e9b]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            {t(lang, "ai.form.interests")}
          </label>
          <div className="relative">
            <textarea
              value={form.interests}
              maxLength={250}
              rows={3}
              placeholder={t(lang, "ai.form.interestsPlaceholder")}
              onChange={(e) =>
                setForm({ ...form, interests: e.target.value })
              }
              className="w-full resize-none rounded-xl border border-black/10 bg-white p-4 pb-6 text-sm text-[var(--text)] outline-none placeholder:text-gray-400 focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-gray-400">
              {form.interests.length}/250
            </span>
          </div>
        </div>

        <Button
          className="w-full cursor-pointer gap-2"
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
        >
          <FaMagic />
          {loading ? t(lang, "ai.form.generating") : t(lang, "ai.form.generate")}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <FaLock className="text-[10px]" />
          {t(lang, "ai.form.disclaimer")}
        </p>
      </div>
    </div>
  );
}
