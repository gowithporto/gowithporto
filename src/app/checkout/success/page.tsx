"use client";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "@/components/ui/LocalizedLink";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { clearCart } from "@/store/slices/cartSlice";

const REDIRECT_DELAY = 1500;

type Status = "confirming" | "success" | "error" | "missing";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>(
    sessionId ? "confirming" : "missing",
  );

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          return;
        }
        dispatch(clearCart());
        setStatus("success");
        setTimeout(() => {
          if (!cancelled) router.replace("/dashboard");
        }, REDIRECT_DELAY);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, dispatch, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-24 pb-16 sm:pt-28">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-10 text-center shadow-sm">
        {status === "confirming" && (
          <>
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#2c6e9b]/20 border-t-[#2c6e9b]" />
            <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--primary)]">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we finalize your order.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--primary)]">
              Payment Successful!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for your order. Taking you to your dashboard…
            </p>
            <div className="mx-auto mt-6 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-[#2c6e9b]/10">
              <div className="h-full w-full origin-left animate-[shrink-width_1.5s_linear_forwards] bg-[#2c6e9b]" />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--primary)]">
              We couldn&apos;t confirm your payment
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              If you were charged, contact support with your payment
              reference.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-xl bg-[#2c6e9b] px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "missing" && (
          <>
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-6 font-serif text-2xl font-semibold text-[var(--primary)]">
              No payment session found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              This page is only reachable right after a checkout.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-[#2c6e9b] px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md"
            >
              Back to Shop
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center px-4 pt-24 pb-16 sm:pt-28">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#2c6e9b]/20 border-t-[#2c6e9b]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
