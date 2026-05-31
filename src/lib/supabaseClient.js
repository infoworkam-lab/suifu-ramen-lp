import { createClient } from "@supabase/supabase-js";

const env = import.meta.env ?? {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-anon-key")
);

const supabaseFetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const url = typeof input === "string" ? input : input?.url;
    console.error("SUPABASE HTTP ERROR", response.status, url);
  }
  return response;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: supabaseFetch
      }
    })
  : null;
