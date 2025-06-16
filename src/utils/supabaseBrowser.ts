import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "./types";

export const supabaseBrowser = () =>
  createClientComponentClient<Database>();
