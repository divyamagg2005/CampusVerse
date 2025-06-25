"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";
import Link from "next/link";

export default function Header() {
  const { session } = useSessionContext();
  const supabase = supabaseBrowser();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <header className="w-full flex justify-between items-center p-4 border-b border-primary glass-dark sticky top-0 z-50">
      <Link href="/">
        <h1 className="text-xl font-bold tracking-tight text-foreground">CampusVerse</h1>
      </Link>
      {session && (
        <button onClick={signOut} className="text-sm text-primary font-medium underline hover:text-secondary transition-colors">
          Sign Out
        </button>
      )}
    </header>
  );
}
