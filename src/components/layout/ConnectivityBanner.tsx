"use client";

import { logoMarkDataUri } from "@/assets/logoMarkDataUri";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const TOAST_ID = "connectivity";
const PING_URL = "/robots.txt";
const PING_INTERVAL_MS = 20000;
const PING_TIMEOUT_MS = 6000;

function OfflineToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#eab657]/40" />
        {/* eslint-disable-next-line @next/next/no-img-element -- must render with zero network access, this is the "you're offline" icon itself */}
        <img
          src={logoMarkDataUri}
          alt=""
          width={20}
          height={20}
          className="relative animate-pulse rounded-full"
        />
      </span>
      <span className="text-sm font-medium text-[#2c6e9b]">{message}</span>
    </div>
  );
}

export default function ConnectivityBanner() {
  const { lang } = useLanguage();
  const wasOfflineRef = useRef(false);
  const offlineMessage = t(lang, "offline.message");
  const reconnectedMessage = t(lang, "offline.reconnected");

  useEffect(() => {
    let cancelled = false;

    const showOffline = () => {
      wasOfflineRef.current = true;
      toast.custom(<OfflineToast message={offlineMessage} />, {
        id: TOAST_ID,
        duration: Infinity,
        position: "top-center",
      });
    };

    const showBackOnline = () => {
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        toast.success(reconnectedMessage, { id: TOAST_ID, duration: 2500 });
      }
    };

    const ping = async () => {
      if (document.visibilityState !== "visible") return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      try {
        await fetch(PING_URL, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!cancelled) showBackOnline();
      } catch {
        if (!cancelled) showOffline();
      } finally {
        clearTimeout(timeout);
      }
    };

    const handleOffline = () => showOffline();
    const handleOnline = () => ping();

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    const pingTimer = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearInterval(pingTimer);
      toast.dismiss(TOAST_ID);
    };
  }, [offlineMessage, reconnectedMessage]);

  return null;
}
