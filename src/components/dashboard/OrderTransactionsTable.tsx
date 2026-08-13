"use client";

import { CalendarDaysIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import {
  FaCcAmex,
  FaCcDiscover,
  FaCcMastercard,
  FaCcVisa,
  FaCreditCard,
} from "react-icons/fa";

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  status: string;
  stripeSessionId?: string;
  cardBrand?: string;
  cardLast4?: string;
};

const PAGE_SIZE = 7;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "amount-asc", label: "Lowest Amount" },
];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  pending: "bg-gray-100 text-gray-700",
};

function CardIcon({ brand }: { brand?: string }) {
  switch (brand) {
    case "visa":
      return <FaCcVisa className="h-5 w-5 text-[#1a1f71]" />;
    case "mastercard":
      return <FaCcMastercard className="h-5 w-5 text-[#eb001b]" />;
    case "amex":
      return <FaCcAmex className="h-5 w-5 text-[#2e77bc]" />;
    case "discover":
      return <FaCcDiscover className="h-5 w-5 text-[#ff6000]" />;
    default:
      return <FaCreditCard className="h-4 w-4 text-gray-400" />;
  }
}

function downloadCSV(rows: Order[]) {
  const header = ["Date", "Transaction ID", "Amount", "Payment Method", "Status"];

  const lines = rows.map((o) => [
    new Date(o.createdAt).toLocaleString(),
    o.stripeSessionId ?? o._id,
    `EUR ${o.total.toFixed(2)}`,
    o.cardLast4 ? `${o.cardBrand ?? "card"} •••• ${o.cardLast4}` : "Card",
    o.status,
  ]);

  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gowithporto-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function OrderTransactionsTable({ orders }: { orders: Order[] }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const filterKey = `${dateFrom}|${dateTo}|${sortBy}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const filtered = useMemo(() => {
    let rows = [...orders];

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      rows = rows.filter((o) => new Date(o.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      rows = rows.filter((o) => new Date(o.createdAt).getTime() <= to);
    }

    rows.sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount-desc") return b.total - a.total;
      if (sortBy === "amount-asc") return a.total - b.total;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return rows;
  }, [orders, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-gray-500">
            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-32 bg-transparent text-xs text-[var(--text)] outline-none"
            />
            <span className="text-gray-300">&ndash;</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-32 bg-transparent text-xs text-[var(--text)] outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm text-[var(--text)] outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => downloadCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-[#2c6e9b]/30 px-4 py-2 text-sm font-medium text-[#2c6e9b] transition hover:bg-[#2c6e9b]/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download Statement
        </button>
      </div>

      <h2 className="px-6 pt-6 font-serif text-xl font-medium text-[#173d5c]">
        Product Purchase History
      </h2>

      {filtered.length === 0 ? (
        <p className="p-6 text-sm text-gray-500">No product purchases found.</p>
      ) : (
        <>
          <div className="overflow-x-auto p-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transaction ID
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Method
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {pageItems.map((o) => (
                  <tr key={o._id}>
                    <td className="py-3 pr-4 text-sm text-[var(--text)]">
                      {new Date(o.createdAt).toLocaleDateString()}{" "}
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      {(o.stripeSessionId ?? o._id).slice(-12)}...
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-[var(--text)]">
                      &euro; {o.total.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-sm text-[var(--text)]">
                        <CardIcon brand={o.cardBrand} />
                        {o.cardLast4 ? `•••• ${o.cardLast4}` : "Card"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_STYLES[o.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition cursor-pointer ${
                    n === page
                      ? "bg-[#2c6e9b] text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
