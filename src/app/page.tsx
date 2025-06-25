"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import FloatingActionButton from "@/components/FloatingActionButton";
import Feed from "@/components/Feed";
import Landing from "@/components/Landing";

export default function Home() {
  const { session } = useSessionContext();

  if (!session) {
    return <Landing />;
  }

  return (
    <main className="flex flex-col items-center gap-8 p-4">
      <Feed />
      <FloatingActionButton />
    </main>
  );
}