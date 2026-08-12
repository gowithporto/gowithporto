import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import FavoritesList from "@/components/dashboard/FavoritesList";

async function getFavorites() {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/favorites`, {
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

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const favorites = await getFavorites();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-[#173d5c]">
        My Favorites
      </h1>
      <FavoritesList favorites={favorites} />
    </div>
  );
}
