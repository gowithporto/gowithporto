"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState } from "react";

const TOPICS = [
  "General Question",
  "Order Issue",
  "Bike Rental Booking",
  "Souvenir Marketplace / Store Owner",
  "Account & Privacy",
  "Partnership / Press",
  "Other",
];

const SUPPORT_EMAIL = "support@gowithporto.pt";

export default function ContactPage() {
  return (
    <div className="space-y-12 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          Contact Support
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-[var(--text)]">
          Have a question about an order, a booking, or GoWithPorto in general? We&apos;re a
          small, Porto-based team and read every message ourselves.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* INFO CARD */}
        <div className="space-y-5 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">Get in touch</h2>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
              <EnvelopeIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#1d3d5c]">Email</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm text-[var(--text)] hover:text-[#2c6e9b] hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
              <MapPinIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#1d3d5c]">Based in</p>
              <p className="text-sm text-[var(--text)]">Porto, Portugal</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
              <ClockIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#1d3d5c]">Response time</p>
              <p className="text-sm text-[var(--text)]">
                We usually reply within 1–2 business days.
              </p>
            </div>
          </div>

          <div className="border-t border-black/5 pt-5 text-sm text-[var(--text)]">
            Looking for a quick answer first? Check our{" "}
            <a href="/faq" className="font-medium text-[#2c6e9b] underline hover:no-underline">
              Help Center
            </a>
            .
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

/**
 * Mounted directly (not gated on session status) so the form is usable immediately;
 * name/email simply start blank for signed-out or not-yet-loaded sessions.
 */
function ContactForm() {
  const { data: session } = useSession();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
        <h3 className="font-serif text-lg font-medium text-[#1d3d5c]">Message sent</h3>
        <p className="text-sm text-[var(--text)]">
          Thanks for reaching out &mdash; we&apos;ll get back to you at {email} soon.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2 cursor-pointer"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
        />
      </div>

      <Select
        label="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        options={TOPICS}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-black/60">Message</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help..."
          className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={status === "sending"} className="w-full cursor-pointer sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
