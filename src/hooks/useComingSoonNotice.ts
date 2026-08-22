"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function useComingSoonNotice() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("notice") !== "coming-soon") return;
    toast("Buying is coming soon — browsing only for now!");
    url.searchParams.delete("notice");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, []);
}
