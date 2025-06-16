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
    <header className="w-full flex justify-between items-center p-4 border-b">
      <Link href="/">
        <h1 className="text-lg font-semibold">College Feed</h1>
      </Link>
      {session ? (
        <button onClick={signOut} className="text-sm underline">
          Sign Out
        </button>
      ) : (
        <Link href="/auth" className="text-sm underline">
          Sign In
        </Link>
      )}
    </header>
  );
}
