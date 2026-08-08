import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import currentBalanceBg from "@/assets/8. ai credit transactions page/current balance bg.png";
import BuyCreditsCTA from "@/components/dashboard/BuyCreditsCTA";
import TransactionsTable from "@/components/dashboard/TransactionsTable";

async function getTransactions() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/transactions`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    return [];
  }
  return res.json();
}

async function getCredits() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/credits`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  if (!res.ok) return { credits: 0, memberSince: null };
  return res.json();
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const [transactions, creditData] = await Promise.all([
    getTransactions(),
    getCredits(),
  ]);

  const totalCreditsPurchased = transactions.reduce(
    (sum: number, t: any) => sum + t.creditsAdded,
    0,
  );
  const totalSpentCents = transactions.reduce(
    (sum: number, t: any) => sum + t.amount,
    0,
  );
  const currency = (transactions[0]?.currency ?? "eur").toUpperCase();
  const totalCreditsUsed = Math.max(
    totalCreditsPurchased - creditData.credits,
    0,
  );
  const memberSince = creditData.memberSince
    ? new Date(creditData.memberSince).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "—";

  const stats = [
    {
      label: "Total Credits Purchased",
      value: totalCreditsPurchased,
      icon: WalletIcon,
    },
    {
      label: "Total Spent",
      value: `${currency} ${(totalSpentCents / 100).toFixed(2)}`,
      icon: BanknotesIcon,
    },
    {
      label: "Total Credits Used",
      value: totalCreditsUsed,
      icon: ArrowPathIcon,
    },
    {
      label: "Member Since",
      value: memberSince,
      icon: CalendarDaysIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#173d5c]">
            AI Credits &amp; Transactions
          </h1>
          <p className="mt-1 text-gray-500">
            Track your credit purchases and usage history.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-sm">
          <Image src={currentBalanceBg} alt="" fill className="object-cover" />
          <div className="relative flex items-center gap-3 px-6 py-4 text-white">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
              <CreditCardIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs opacity-80">Current Balance</p>
              <p className="text-xl font-bold">{creditData.credits} Credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-xs font-medium text-gray-500">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-[#173d5c]">
                {stat.value}
              </p>
            </div>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf3fa]">
              <stat.icon className="h-5 w-5 text-[#2c6e9b]" />
            </div>
          </div>
        ))}
      </div>

      <TransactionsTable transactions={transactions} />

      <BuyCreditsCTA />
    </div>
  );
}
