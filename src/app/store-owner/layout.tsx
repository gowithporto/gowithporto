import StoreOwnerSidebar from "@/components/layout/StoreOwnerSidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Get the current pathname from the server context (only works for middleware, not layouts)
  // For layouts, you can't reliably get the pathname, so use a workaround:
  // Only show sidebar if session exists and user is STORE_OWNER
  const showSidebar = session && session.user.role === "STORE_OWNER";

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen mt-32 bg-[#f4f6f9]">
      {showSidebar && <StoreOwnerSidebar />}
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
