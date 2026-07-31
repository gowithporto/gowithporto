"use client";

import Footer from "@/components/layout/Footer";
import StoreOwnerFooter from "@/components/layout/StoreOwnerFooter";
import UserFooter from "@/components/layout/UserFooter";
import { useSession } from "next-auth/react";

export default function ConditionalFooter() {
  const { data: session } = useSession();

  if (session?.user?.role === "ADMIN") {
    return null;
  }

  if (session?.user?.role === "STORE_OWNER") {
    return <StoreOwnerFooter />;
  }

  if (session?.user?.role === "USER") {
    return <UserFooter />;
  }

  return <Footer />;
}
