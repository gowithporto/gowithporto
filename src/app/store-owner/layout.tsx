"use client";

import { usePathname } from "next/navigation";

import StoreOwnerGuard from "@/components/store-owner/StoreOwnerGuard";
import StoreOwnerSidebar from "@/components/layout/StoreOwnerSidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/store-owner/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <StoreOwnerGuard>
      <div className="flex min-h-screen mt-32 bg-[#f4f6f9]">
        <StoreOwnerSidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </StoreOwnerGuard>
  );
}
