"use client";

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

const TRAVEL_STYLES = [
  { label: "Culture & History", icon: FaLandmark },
  { label: "Food & Wine", icon: FaWineGlassAlt },
  { label: "Adventure", icon: FaHiking },
  { label: "Relaxation", icon: FaSpa },
  { label: "Nightlife", icon: FaMoon },
  { label: "Shopping", icon: FaShoppingBag },
];

const fieldClass =
  "w-full appearance-none rounded-xl border border-black/10 bg-white py-3 pl-9 pr-9 text-sm text-[var(--text)] outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20";

export default function AIPlannerForm() {
  const { data: session } = useSession();
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

  const toggleStyle = (label: string) => {
    setForm((f) => ({
      ...f,
      travelStyles: f.travelStyles.includes(label)
        ? f.travelStyles.filter((s) => s !== label)
        : [...f.travelStyles, label],
    }));
  };

  async function handlePayment() {
    const res = await fetch("/api/payments/ai-credits", {
      method: "POST",
    });

    if (!res.ok) {
      alert("Unable to start payment. Please try again.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    window.location.href = data.url;
  }

  async function handleSubmit() {
    if (!session) {
      toast.custom(
        (t) => (
          <div
            className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-lg transition-all duration-300"
            style={{
              maxWidth: 360,
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
              <FaLock className="text-sm" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Login required
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Sign in to generate your personalized Porto plan.
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
        alert(data.error || "Failed to generate plan. Please try again.");
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
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-[var(--primary)]">
        <h2 className="font-serif text-xl font-medium sm:text-2xl">
          Let&apos;s plan your unforgettable Porto adventure
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-gray-500">
        The more details you share, the better your AI travel plan will be.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            Destination
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
          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">
              Number of days
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

          <div>
            <label className="mb-1 block text-sm font-medium text-black/60">
              Travel dates (optional)
            </label>
            <div className="relative">
              <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={form.dates}
                onChange={(e) => setForm({ ...form, dates: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-gray-400 focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            Budget
          </label>
          <div className="relative">
            <FaCoins className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className={fieldClass}
            >
              <option value="" disabled>
                Select budget
              </option>
              <option value="Cheap">Cheap</option>
              <option value="Medium">Medium</option>
              <option value="Luxury">Luxury</option>
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            Travel group
          </label>
          <div className="relative">
            <FaUsers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={form.people}
              onChange={(e) => setForm({ ...form, people: e.target.value })}
              className={fieldClass}
            >
              <option value="" disabled>
                Select group size
              </option>
              <option value="Solo">Solo</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
            </select>
            <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black/60">
            Travel style (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map(({ label, icon: Icon }) => {
              const selected = form.travelStyles.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleStyle(label)}
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                    selected
                      ? "border-[#2c6e9b] bg-[#2c6e9b]/5 text-[#2c6e9b]"
                      : "border-black/10 text-gray-600 hover:border-black/20"
                  }`}
                >
                  <Icon className={selected ? "text-[#2c6e9b]" : "text-gray-400"} />
                  {label}
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
            Interests (optional)
          </label>
          <div className="relative">
            <textarea
              value={form.interests}
              maxLength={250}
              rows={3}
              placeholder="e.g. I love local food, art, architecture, hiking..."
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
          {loading ? "Generating Plan..." : "Generate My Porto Plan"}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <FaLock className="text-[10px]" />
          Your information is secure and used only to create your plan.
        </p>
      </div>
    </div>
  );
}
