import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaCalendarAlt, FaCoins, FaUsers } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";

async function getAIHistory() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/ai-history`, {
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

export default async function AIHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const history = await getAIHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#173d5c]">AI History</h1>
        <p className="mt-1 text-gray-500">
          Review your past AI-generated plans.
        </p>
      </div>

      {history.length === 0 && (
        <p className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No AI history found.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {history.map((item: any) => (
          <Link
            key={item._id}
            href={`/ai/result?id=${item._id}`}
            className="group block rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#2c6e9b]/30"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <FaWandMagicSparkles className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#173d5c] transition-colors group-hover:text-[#2c6e9b]">
                    Trip to Porto
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-[#2c6e9b]">
                View Plan &rarr;
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1 rounded-md border border-black/5 bg-gray-50 px-2 py-1">
                <FaCalendarAlt className="text-[#2c6e9b]" />
                {item.prompt.days} Days
              </span>
              <span className="flex items-center gap-1 rounded-md border border-black/5 bg-gray-50 px-2 py-1">
                <FaCoins className="text-[#2c6e9b]" />
                {item.prompt.budget}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-black/5 bg-gray-50 px-2 py-1">
                <FaUsers className="text-[#2c6e9b]" />
                {item.prompt.people}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
