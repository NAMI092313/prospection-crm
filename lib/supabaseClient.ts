import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase par défaut (sans auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Supabase avec JWT de NextAuth pour RLS
export function createSupabaseClient(accessToken?: string) {
  if (!accessToken) {
    return supabase;
  }

  // Créer un client avec le JWT pour Row Level Security
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
