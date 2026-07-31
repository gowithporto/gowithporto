"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#f4f6f9] dark:bg-[#0b1219]">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
            <p className="mt-10 pb-2 text-center text-xs text-black/30 dark:text-white/30">
              © {new Date().getFullYear()} GoWithPorto Admin Portal. All
              rights reserved.
            </p>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
