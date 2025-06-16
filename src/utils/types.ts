/*
  This is a minimal placeholder for Supabase generated types. Replace with the
  output of the Supabase CLI `supabase gen types typescript --project-id <id>`
  for full type-safety.
*/
export type Tables = {
  users: {
    Row: {
      id: string;
      email: string | null;
      college: string | null;
      created_at: string | null;
    };
    Insert: {
      id: string;
      email?: string | null;
      college?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      email?: string | null;
      college?: string | null;
      created_at?: string | null;
    };
  };
};

export interface Database {
  public: {
    Tables: Tables;
  };
}
