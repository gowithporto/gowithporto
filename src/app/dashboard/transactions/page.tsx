import { CreditCardIcon } from "@heroicons/react/24/outline";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  if (!res.ok) return { credits: 0 };
  return res.json();
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const [transactions, creditData] = await Promise.all([
    getTransactions(),
    getCredits(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-[#173d5c]">
          Transactions &amp; Credits
        </h1>
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#2c6e9b] px-5 py-3 text-white shadow-sm">
          <CreditCardIcon className="h-6 w-6 opacity-80" />
          <div>
            <p className="text-xs opacity-80">Current Balance</p>
            <p className="text-xl font-bold">{creditData.credits} Credits</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <h2 className="px-6 pt-6 font-serif text-xl text-[#173d5c]">
          Purchase History
        </h2>

        {transactions.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto p-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Credits Added
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Session ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {transactions.map((t: any) => (
                  <tr key={t._id}>
                    <td className="py-3 pr-4 text-sm text-[var(--text)]">
                      {new Date(t.createdAt).toLocaleDateString()}{" "}
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-[var(--text)]">
                      {t.currency.toUpperCase()} {(t.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-sm font-bold text-green-600">
                      +{t.creditsAdded}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      {t.stripeSessionId.slice(-10)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
