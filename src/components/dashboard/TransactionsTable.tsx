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

type Transaction = {
  _id: string;
  createdAt: string;
  amount: number;
  currency: string;
  creditsAdded: number;
  stripeSessionId: string;
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

function downloadCSV(rows: Transaction[]) {
  const header = [
    "Date",
    "Transaction ID",
    "Amount",
    "Credits Added",
    "Payment Method",
    "Status",
  ];

  const lines = rows.map((t) => [
    new Date(t.createdAt).toLocaleString(),
    t.stripeSessionId,
    `${t.currency.toUpperCase()} ${(t.amount / 100).toFixed(2)}`,
    `+${t.creditsAdded}`,
    t.cardLast4 ? `${t.cardBrand ?? "card"} •••• ${t.cardLast4}` : "Card",
    "Completed",
  ]);

  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gowithporto-statement-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
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
    let rows = [...transactions];

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      rows = rows.filter((t) => new Date(t.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      rows = rows.filter((t) => new Date(t.createdAt).getTime() <= to);
    }

    rows.sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return rows;
  }, [transactions, dateFrom, dateTo, sortBy]);

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

      <h2 className="px-6 pt-6 font-serif text-xl text-[#173d5c]">
        Purchase History
      </h2>

      {filtered.length === 0 ? (
        <p className="p-6 text-sm text-gray-500">No transactions found.</p>
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
                    Credits Added
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
                {pageItems.map((t) => (
                  <tr key={t._id}>
                    <td className="py-3 pr-4 text-sm text-[var(--text)]">
                      {new Date(t.createdAt).toLocaleDateString()}{" "}
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      {t.stripeSessionId.slice(-12)}...
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-[var(--text)]">
                      {t.currency.toUpperCase()} {(t.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-sm font-bold text-green-600">
                      +{t.creditsAdded}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-sm text-[var(--text)]">
                        <CardIcon brand={t.cardBrand} />
                        {t.cardLast4 ? `•••• ${t.cardLast4}` : "Card"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Completed
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
