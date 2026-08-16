"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface DisputeRow {
  orderId: string;
  itemId: string;
  storeName: string;
  buyerEmail: string;
  itemTitle: string;
  quantity: number;
  price: number;
  deliveryType?: string;
  deliveryFee?: number;
  reportedBy?: "buyer" | "handler";
  reasonCode?: string;
  note?: string;
  reportedAt?: string;
}

const REASON_LABELS: Record<string, string> = {
  item_not_received: "Item not received",
  item_defective_or_wrong: "Item defective or wrong",
  no_longer_needed: "No longer needed",
  buyer_not_present: "Buyer wasn't present",
  wrong_address: "Wrong address",
  buyer_refused: "Buyer refused",
  item_issue: "Problem with the item",
  other: "Other",
};

export default function DisputesPage() {
  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<DisputeRow | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/disputes");
      if (!res.ok) throw new Error();
      setRows(await res.json());
    } catch {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review reported fulfillment issues and decide how funds are split.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No open disputes.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.orderId}:${row.itemId}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      #{row.orderId.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {row.storeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {row.itemTitle} × {row.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 capitalize">
                      {row.reportedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {REASON_LABELS[row.reasonCode || ""] || row.reasonCode}
                      {row.note && (
                        <span className="block max-w-[200px] truncate text-xs text-gray-400">
                          {row.note}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {row.reportedAt
                        ? new Date(row.reportedAt).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setResolving(row)}
                        className="cursor-pointer rounded-lg bg-[#2c6e9b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2c6e9b]/90"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {resolving && (
        <ResolveModal
          row={resolving}
          onClose={() => setResolving(null)}
          onResolved={() => {
            setResolving(null);
            fetchDisputes();
          }}
        />
      )}
    </div>
  );
}

function ResolveModal({
  row,
  onClose,
  onResolved,
}: {
  row: DisputeRow;
  onClose: () => void;
  onResolved: () => void;
}) {
  const [outcome, setOutcome] = useState<"seller_fault" | "buyer_fault" | "split">(
    "seller_fault",
  );
  const [buyerPct, setBuyerPct] = useState(50);
  const [sellerPct, setSellerPct] = useState(40);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemTotal = row.price * row.quantity;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/disputes/${row.orderId}/items/${row.itemId}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outcome,
            ...(outcome === "split" ? { buyerPct, sellerPct } : {}),
            notes,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resolve");
        return;
      }
      toast.success("Dispute resolved");
      onResolved();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">Resolve Dispute</h2>
        <p className="mt-1 text-sm text-gray-500">
          {row.itemTitle} × {row.quantity} — €{itemTotal.toFixed(2)}
        </p>

        <div className="mt-4 space-y-2">
          {[
            {
              value: "seller_fault",
              label: "Seller's fault",
              desc: "Full refund to buyer, seller gets nothing",
            },
            {
              value: "buyer_fault",
              label: "Buyer's fault",
              desc: "Normal payout to seller + platform commission",
            },
            {
              value: "split",
              label: "Ambiguous — split",
              desc: "Admin-chosen split between buyer and seller",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                outcome === opt.value
                  ? "border-[#2c6e9b] bg-[#2c6e9b]/5"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="outcome"
                checked={outcome === opt.value}
                onChange={() => setOutcome(opt.value as typeof outcome)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {opt.label}
                </span>
                <span className="block text-xs text-gray-500">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>

        {outcome === "split" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Buyer refund %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={buyerPct}
                onChange={(e) => setBuyerPct(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Seller %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={sellerPct}
                onChange={(e) => setSellerPct(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <p className="col-span-2 text-xs text-gray-400">
              Remaining {Math.max(0, 100 - buyerPct - sellerPct)}% stays as
              platform commission. Delivery fee always stays with the seller
              in this outcome.
            </p>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || (outcome === "split" && buyerPct + sellerPct > 100)}
            onClick={submit}
            className="cursor-pointer rounded-lg bg-[#2c6e9b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2c6e9b]/90 disabled:opacity-60"
          >
            {submitting ? "Resolving..." : "Confirm Resolution"}
          </button>
        </div>
      </div>
    </div>
  );
}
