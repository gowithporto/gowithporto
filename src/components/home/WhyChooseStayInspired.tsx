"use client";

import Image from "next/image";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

import lighthouse from "@/assets/1. home page/why choose & stay inspired/why choose gowithporto.png";
import grapevine from "@/assets/1. home page/why choose & stay inspired/stay inspired.png";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const reasons = [
  "AI-powered personalized trip plans",
  "Handpicked local experiences",
  "Trusted by travelers worldwide",
  "24/7 customer support",
];

export default function WhyChooseStayInspired() {
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
            <h3 className="font-serif text-2xl text-[var(--primary)]">
              Why Choose GoWithPorto?
            </h3>
            <ul className="mt-5 space-y-3">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-[#4b5b66]">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-[var(--primary)]" />
                  {reason}
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
            <h3 className="font-serif text-2xl text-[var(--primary)]">
              Stay Inspired
            </h3>
            <p className="mt-3 max-w-xs text-sm text-[#4b5b66]">
              Get travel tips, exclusive offers and Porto stories straight to
              your inbox.
            </p>

            {subscribed ? (
              <p className="mt-5 text-sm font-medium text-[var(--primary)]">
                Thanks for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-5 flex max-w-sm gap-2">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90"
                />
                <Button type="submit" className="shrink-0 cursor-pointer">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
