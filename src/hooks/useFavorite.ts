"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export type FavoriteItemType = "product" | "attraction" | "localExperience" | "bikeRental";

export function useFavorite(itemType: FavoriteItemType, itemId?: string) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || !itemId) {
      setFavorited(false);
      return;
    }
    fetch(`/api/favorites/check?itemType=${itemType}&itemId=${itemId}`)
      .then((res) => (res.ok ? res.json() : { favorited: false }))
      .then((data) => setFavorited(!!data.favorited))
      .catch(() => setFavorited(false));
  }, [session, itemType, itemId]);

  const toggle = useCallback(async () => {
    if (!session) {
      toast.error("Log in to save favorites");
      return;
    }
    if (!itemId || loading) return;

    const next = !favorited;
    setLoading(true);
    setFavorited(next);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setFavorited(!!data.favorited);
    } catch {
      setFavorited(!next);
      toast.error("Couldn't update favorites");
    } finally {
      setLoading(false);
    }
  }, [session, itemType, itemId, favorited, loading]);

  return { favorited, toggle, loading };
}
