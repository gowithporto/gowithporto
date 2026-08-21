"use client";

import { RootState } from "@/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Cart state is seeded from localStorage synchronously on the client but
// starts empty during SSR (no `window` on the server) — reading the real
// count on the very first render would mismatch the server-rendered HTML.
// Returning 0 until after mount keeps that first render identical, then a
// normal client-side update (not a hydration diff) fills in the real count.
export function useCartCount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  return mounted ? count : 0;
}
