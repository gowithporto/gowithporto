"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/dashboard" },
    { name: "AI History", href: "/dashboard/ai-history" },
    { name: "Orders", href: "/dashboard/orders" },
    { name: "Transactions", href: "/dashboard/transactions" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 mt-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
