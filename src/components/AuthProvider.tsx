"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => supabaseBrowser());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
