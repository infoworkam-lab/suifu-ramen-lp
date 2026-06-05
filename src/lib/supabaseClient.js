import { createClient } from "@supabase/supabase-js";

const env = import.meta.env ?? {};
const rawSupabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

function normalizeSupabaseUrl(url) {
  if (!url) return "";
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-anon-key")
);

const supabaseFetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url;
  console.log("SUPABASE REQUEST", init?.method || "GET", url);
  const response = await fetch(input, init);
  if (!response.ok) {
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
