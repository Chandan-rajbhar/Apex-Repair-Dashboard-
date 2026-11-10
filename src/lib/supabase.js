import { createClient } from "@supabase/supabase-js";

// Check environment variables first, then localStorage override for runtime settings
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== "undefined" ? localStorage.getItem("apex_supabase_url") : null;
const localKey = typeof window !== "undefined" ? localStorage.getItem("apex_supabase_key") : null;

export const supabaseUrl = localUrl || envUrl || "";
export const supabaseAnonKey = localKey || envKey || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    })
  : null;

export const updateSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem("apex_supabase_url", url.trim());
  else localStorage.removeItem("apex_supabase_url");

  if (key) localStorage.setItem("apex_supabase_key", key.trim());
  else localStorage.removeItem("apex_supabase_key");

  window.location.reload();
};

