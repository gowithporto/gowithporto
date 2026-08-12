"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StoreOwnerGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/store-owner/login");
      return;
    }

    if (session?.user?.role !== "STORE_OWNER") {
      router.push("/");
    }
  }, [session, status, router]);

  if (pathname === "/store-owner/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-[#2c6e9b]" />
      </div>
    );
  }

  if (session?.user?.role === "STORE_OWNER") {
    return <>{children}</>;
  }

  return null;
}
