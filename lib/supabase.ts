import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null when the environment variables are not configured; forms fall back to a
// mailto notice instead of breaking.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

// Postgres unique-constraint violation (duplicate email).
export const DUPLICATE_KEY_CODE = "23505";
