"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/utils/supabaseBrowser";

const colleges = [
  "VIT Vellore",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "BITS Pilani",
  "NIT Trichy",
  "IIIT Hyderabad",
  "DTU Delhi",
  "NSUT Delhi",
  "MIT",
  "Stanford",
  "Harvard",
  "Caltech",
  "Cambridge",
  "Oxford",
  "ETH Zurich",
  "NUS Singapore"
];

export default function SelectCollegePage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [college, setCollege] = useState(colleges[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/auth");
    }
  }, [isLoading, session, router]);

  const saveCollege = async () => {
    if (!session?.user) {
      router.push("/auth");
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ college })
        .eq("id", session.user.id);
      
      if (error) throw error;

      // refresh the JWT/session so RLS policies include college
      await supabase.auth.refreshSession();
      router.push("/");
    } catch (err) {
      console.error("Error saving college:", err);
      alert("Failed to save college. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <h1 className="text-2xl font-bold">Select your College</h1>
      <select
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        className="border p-2 rounded"
      >
        {colleges.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        onClick={saveCollege}
        disabled={saving}
        className="bg-foreground text-background py-2 px-4 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
