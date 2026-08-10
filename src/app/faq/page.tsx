"use client";

import { ChevronDownIcon, LifebuoyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is GoWithPorto?",
        answer:
          "GoWithPorto is your personal AI travel companion for exploring Porto. Plan a personalized itinerary with our AI trip planner, discover top attractions and local experiences, book bike rentals, and shop authentic souvenirs from independent local shops — all in one place.",
      },
      {
        question: "Do I need an account to use GoWithPorto?",
        answer:
          "You can browse attractions, local experiences, and the souvenir shop without signing in. To save a trip, generate an AI itinerary, add items to your cart, or check out, you'll need to sign in with your Google account.",
      },
      {
        question: "How does the AI trip planner work?",
        answer:
          "Head to the AI Planner, tell it your dates, interests, and pace, and it generates a personalized Porto itinerary in moments. Every generation uses one AI credit. Your past itineraries are saved under My Trips in your dashboard so you can revisit them anytime.",
      },
      {
        question: "What are AI credits and how do I get more?",
        answer:
          "AI credits power the itinerary generator — one credit is used each time you generate a trip plan. You can purchase small credit packs securely through Stripe checkout whenever you need more.",
      },
      {
        question: "Which languages does the site support?",
        answer:
          "GoWithPorto is currently available in English, French, and Spanish. Use the language switcher (globe icon) in the header to change language at any time.",
      },
    ],
  },
  {
    title: "Orders & Payments",
    items: [
      {
        question: "How do I pay for souvenirs or bookings?",
        answer:
          "All payments are processed securely through Stripe at checkout. We accept major debit and credit cards. Card details are handled entirely by Stripe — GoWithPorto never stores your full card number.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes. Go to Dashboard → Order History to see the status of every order. You'll also receive email confirmations when an order is placed and when it ships.",
      },
      {
        question: "What is your refund and returns policy?",
        answer:
          "Souvenirs are sold and fulfilled by independent local Porto shops, so exact return terms can vary by item — check the product listing for details. If something arrives damaged, wrong, or doesn't show up, contact our support team and we'll help resolve it with the seller.",
      },
      {
        question: "Is my payment information stored on GoWithPorto?",
        answer:
          "No. Card details are collected and processed directly by Stripe, our PCI-compliant payment provider. GoWithPorto's servers never see or store your full card number.",
      },
    ],
  },
  {
    title: "Souvenir Marketplace",
    items: [
      {
        question: "Who sells the souvenirs on GoWithPorto?",
        answer:
          "Every item in the Souvenir Marketplace is listed and fulfilled by an independent local Porto shop or maker, not by GoWithPorto directly. This helps us support small local businesses while giving you authentic, hand-picked finds.",
      },
      {
        question: "How is shipping handled?",
        answer:
          "Shipping is handled by the individual store owner behind each product, so timelines can vary slightly by shop. You'll see estimated shipping details before completing checkout.",
      },
      {
        question: "I run a shop in Porto — can I sell on GoWithPorto?",
        answer:
          "We're always happy to hear from local shop owners. Reach out through our Contact Support page with a bit about your shop and products, and our team will follow up about joining the marketplace.",
      },
    ],
  },
  {
    title: "Bike Rentals",
    items: [
      {
        question: "How do bike rentals work?",
        answer:
          "Browse available bikes under Bike Rentals, choose your dates and pickup location, and complete your booking through checkout. Details on pickup and return are included in your booking confirmation.",
      },
      {
        question: "Can I cancel or change a bike rental booking?",
        answer:
          "Yes — contact our support team as soon as possible with your order number and we'll help you cancel or adjust your booking wherever the rental partner allows it.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    items: [
      {
        question: "How do I sign in?",
        answer:
          "GoWithPorto uses Google Sign-In for a fast, secure login — there's no separate password to remember. Just click Login and continue with your Google account.",
      },
      {
        question: "How do I delete my account or personal data?",
        answer:
          "Contact our support team from the Contact Support page and we'll process your deletion request. See our Privacy Policy for full details on what we collect and your rights.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes — your data is stored on encrypted, access-restricted infrastructure hosted in the EU, and we only work with reputable processors (Google, Stripe, Cloudinary) for the specific tasks they perform. Full details are in our Privacy Policy.",
      },
    ],
  },
];

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-[#1d3d5c]">{item.question}</span>
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
        <p className="min-h-0 text-sm leading-relaxed text-[var(--text)]">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="space-y-12 px-4 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
          <LifebuoyIcon className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
          Help Center
        </h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
        <p className="mt-5 text-[var(--text)]">
          Answers to the questions we hear most about planning, booking, and shopping with
          GoWithPorto. Can&apos;t find what you need?{" "}
          <Link href="/contact" className="font-medium text-[#2c6e9b] underline hover:no-underline">
            Contact our support team
          </Link>
          .
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        {CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8"
          >
            <h2 className="font-serif text-xl font-medium text-[#1d3d5c]">{category.title}</h2>
            <div className="mt-2">
              {category.items.map((item) => (
                <FaqRow key={item.question} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
