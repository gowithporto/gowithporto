"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import StoreOwnerGuard from "@/components/store-owner/StoreOwnerGuard";
import StoreOwnerSidebar from "@/components/layout/StoreOwnerSidebar";
import StoreOwnerTopbar from "@/components/layout/StoreOwnerTopbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/store-owner/login";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <StoreOwnerGuard>
      <div className="flex min-h-screen mt-32 bg-[#f4f6f9]">
        <StoreOwnerSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex flex-1 flex-col">
          <StoreOwnerTopbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </StoreOwnerGuard>
  );
}
