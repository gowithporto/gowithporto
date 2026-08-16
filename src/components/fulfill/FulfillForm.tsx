"use client";

import { useState } from "react";

const REASON_OPTIONS = [
  { value: "buyer_not_present", label: "Buyer wasn't present" },
  { value: "wrong_address", label: "Wrong address" },
  { value: "buyer_refused", label: "Buyer refused the item" },
  { value: "item_issue", label: "Problem with the item" },
  { value: "other", label: "Other" },
];

export default function FulfillForm({
  token,
  isPickup,
}: {
  token: string;
  isPickup: boolean;
}) {
  const [mode, setMode] = useState<"confirm" | "report">("confirm");
  const [pin, setPin] = useState("");
  const [reasonCode, setReasonCode] = useState(REASON_OPTIONS[0].value);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"confirmed" | "reported" | null>(null);
  const [itemTitle, setItemTitle] = useState<string | null>(null);

  const submitConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/fulfill/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error || "Incorrect code, please try again.");
        return;
      }
      setItemTitle(data.itemTitle);
      setDone("confirmed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/fulfill/${token}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonCode, note }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone("reported");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done === "confirmed") {
    return (
      <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
        Confirmed — thank you!
        {itemTitle
          ? ` "${itemTitle}" is marked ${isPickup ? "picked up" : "delivered"}.`
          : ""}
      </div>
    );
  }

  if (done === "reported") {
    return (
      <div className="mt-6 rounded-xl bg-amber-50 p-4 text-center text-sm font-medium text-amber-700">
        Thanks — we&apos;ve logged this and it&apos;ll be reviewed.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {mode === "confirm" ? (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/60">
              Confirmation code
            </label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter the store's fulfillment code"
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#2c6e9b]"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            disabled={submitting || !pin}
            onClick={submitConfirm}
            className="w-full cursor-pointer rounded-xl bg-[#2c6e9b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2c6e9b]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Confirming..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("report");
              setError(null);
            }}
            className="w-full cursor-pointer text-center text-xs text-black/40 underline"
          >
            Couldn&apos;t complete this handoff?
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/60">
              What happened?
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#2c6e9b]"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add details (optional)"
            rows={3}
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#2c6e9b]"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={submitReport}
            className="w-full cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("confirm");
              setError(null);
            }}
            className="w-full cursor-pointer text-center text-xs text-black/40 underline"
          >
            Back to code entry
          </button>
        </>
      )}
    </div>
  );
}
