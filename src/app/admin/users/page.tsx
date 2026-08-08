"use client";

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { cn } from "@/utils/cn";

type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  role: "USER" | "ADMIN" | "STORE_OWNER";
  image?: string;
  credits: number;
  freeUsed: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  topUpsCount: number;
  totalTopUp: number;
  aiPlansCount: number;
};

type SortKey =
  | "name"
  | "role"
  | "credits"
  | "ordersCount"
  | "totalSpent"
  | "aiPlansCount"
  | "createdAt";

const PAGE_SIZE = 10;

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-violet-50 text-violet-600",
  STORE_OWNER: "bg-amber-50 text-amber-600",
  USER: "bg-[#2c6e9b]/10 text-[#2c6e9b]",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  STORE_OWNER: "Store Owner",
  USER: "Traveler",
};

function downloadCSV(rows: AdminUser[]) {
  const header = [
    "Name",
    "Email",
    "Role",
    "Credits",
    "Free Trial Used",
    "Orders",
    "Total Spent",
    "AI Plans",
    "Top-Ups",
    "Joined",
  ];

  const lines = rows.map((u) => [
    u.name || "—",
    u.email,
    ROLE_LABELS[u.role] || u.role,
    u.credits,
    u.freeUsed ? "Yes" : "No",
    u.ordersCount,
    u.totalSpent.toFixed(2),
    u.aiPlansCount,
    u.totalTopUp.toFixed(2),
    new Date(u.createdAt).toLocaleDateString(),
  ]);

  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gowithporto-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterKey = `${search}|${roleFilter}|${sortKey}|${sortDir}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const summary = useMemo(
    () => ({
      total: users.length,
      travelers: users.filter((u) => u.role === "USER").length,
      storeOwners: users.filter((u) => u.role === "STORE_OWNER").length,
      admins: users.filter((u) => u.role === "ADMIN").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    let rows = [...users];

    if (roleFilter !== "ALL") {
      rows = rows.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || a.email).localeCompare(b.name || b.email);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "credits":
          cmp = a.credits - b.credits;
          break;
        case "ordersCount":
          cmp = a.ordersCount - b.ordersCount;
          break;
        case "totalSpent":
          cmp = a.totalSpent - b.totalSpent;
          break;
        case "aiPlansCount":
          cmp = a.aiPlansCount - b.aiPlansCount;
          break;
        default:
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [users, search, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "role" ? "asc" : "desc");
    }
  };

  const summaryCards = [
    {
      label: "Total Users",
      value: summary.total.toLocaleString(),
      icon: UsersIcon,
      color: "bg-[#2c6e9b]/10 text-[#2c6e9b]",
    },
    {
      label: "Travelers",
      value: summary.travelers.toLocaleString(),
      icon: UserGroupIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Store Owners",
      value: summary.storeOwners.toLocaleString(),
      icon: SparklesIcon,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Admins",
      value: summary.admins.toLocaleString(),
      icon: ShieldCheckIcon,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "name", label: "User" },
    { key: "role", label: "Role" },
    { key: "credits", label: "Credits" },
    { key: "ordersCount", label: "Orders" },
    { key: "totalSpent", label: "Total Spent", align: "right" },
    { key: "aiPlansCount", label: "AI Plans" },
    { key: "createdAt", label: "Joined" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-black/50">
            Every traveler, store owner and admin registered on GoWithPorto
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex h-9 w-9 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-[#2c6e9b] cursor-pointer"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  c.color,
                )}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <span className="text-sm text-black/50">
                {c.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1d3d5c]">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-black/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="w-48 bg-transparent text-sm text-[#1d3d5c] outline-none placeholder:text-black/30 sm:w-64"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1d3d5c] outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Travelers</option>
              <option value="STORE_OWNER">Store Owners</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => downloadCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl border border-[#2c6e9b]/30 px-4 py-2 text-sm font-semibold text-[#2c6e9b] transition hover:bg-[#2c6e9b]/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-black/50">
            Loading users...
          </p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-black/50">
            No users found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "cursor-pointer px-5 py-3 text-xs font-medium tracking-wider text-black/40 uppercase select-none",
                          col.align === "right" ? "text-right" : "text-left",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            col.align === "right" ? "flex-row-reverse" : undefined,
                          )}
                        >
                          {col.label}
                          <ArrowsUpDownIcon
                            className={cn(
                              "h-3 w-3",
                              sortKey === col.key
                                ? "text-[#2c6e9b]"
                                : "text-black/20",
                            )}
                          />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {pageItems.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-black/[0.015]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1d3d5c] text-sm font-semibold text-white">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (u.name || u.email).charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1d3d5c]">
                              {u.name || "Unnamed"}
                            </p>
                            <p className="truncate text-xs text-black/40">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            ROLE_STYLES[u.role],
                          )}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#1d3d5c]">
                        {u.credits}
                        {u.freeUsed && (
                          <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/40">
                            trial used
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-black/60">
                        {u.ordersCount}
                        {u.topUpsCount > 0 && (
                          <span className="ml-1 text-xs text-black/30">
                            ({u.topUpsCount} top-ups)
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-[#1d3d5c]">
                        €{u.totalSpent.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-black/60">
                        {u.aiPlansCount}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-black/60">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-black/5 p-4">
                <p className="text-xs text-black/40">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    &laquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-sm font-medium transition cursor-pointer",
                        n === page
                          ? "bg-[#2c6e9b] text-white"
                          : "text-black/50 hover:bg-black/5",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
