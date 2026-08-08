"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REDIRECT_DELAY = 1500;

export default function CheckoutCancelPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/checkout");
    }, REDIRECT_DELAY);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-24 pb-16 sm:pt-28">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--primary)]">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          No charge was made. Taking you back to checkout…
        </p>

        <div className="mx-auto mt-6 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-[#2c6e9b]/10">
          <div className="h-full w-full origin-left animate-[shrink-width_1.5s_linear_forwards] bg-[#2c6e9b]" />
        </div>

        <Link
          href="/checkout"
          className="mt-6 inline-block rounded-xl bg-[#2c6e9b] px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md"
        >
          Return to Checkout Now
        </Link>
      </div>
    </div>
  );
}
