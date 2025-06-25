"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function HeaderConditional() {
  const { session } = useSessionContext();
  const pathname = usePathname() ?? "/";

  // Hide header on landing page or auth routes when not signed in
  if (!session && (pathname === "/" || pathname.startsWith("/auth"))) {
    return null;
  }

  return <Header />;
}
