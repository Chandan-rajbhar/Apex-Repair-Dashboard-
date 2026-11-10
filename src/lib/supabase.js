import { createClient } from "@supabase/supabase-js";

// ==========================================
// Hardcoded Supabase Configuration in Code
// ==========================================
// Project: kqnpsdfkvfwkutgciixj
const DEFAULT_SUPABASE_URL = "https://kqnpsdfkvfwkutgciixj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnBzZGZrdmZ3a3V0Z2NpaXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyOTUzODIsImV4cCI6MjEwOTg3MTM4Mn0.V2SQn8m6I998fcScmzSPQPJ0l-urcMAwdGrGsCg4vTU";

// Publishable Key reference
export const supabasePublishableKey = "sb_publishable_LMg6Z5ZjRhnmTkq4HQtFJQ_Mhy4Kb7E";

// Check optional runtime localStorage override, otherwise use in-code defaults
const getActiveUrl = () => {
  if (typeof window === "undefined") return DEFAULT_SUPABASE_URL;
  const stored = localStorage.getItem("apex_supabase_url");
  if (stored && stored.startsWith("https://")) return stored.trim();
  return DEFAULT_SUPABASE_URL;
};

const getActiveKey = () => {
  if (typeof window === "undefined") return DEFAULT_SUPABASE_ANON_KEY;
  const stored = localStorage.getItem("apex_supabase_key");
  if (stored && stored.trim().length > 10) return stored.trim();
  return DEFAULT_SUPABASE_ANON_KEY;
};

export const supabaseUrl = getActiveUrl();
export const supabaseAnonKey = getActiveKey();

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
  if (url && url.trim().startsWith("https://")) {
    localStorage.setItem("apex_supabase_url", url.trim());
  } else {
    localStorage.removeItem("apex_supabase_url");
  }

  if (key && key.trim().length > 10) {
    localStorage.setItem("apex_supabase_key", key.trim());
  } else {
    localStorage.removeItem("apex_supabase_key");
  }

  window.location.reload();
};
