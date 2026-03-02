import { createClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

let supabase = null;
try {
  if (url && key && url.startsWith("http")) {
    supabase = createClient(url, key);
  }
} catch (e) {
  console.warn("Supabase init failed:", e.message);
}

export { supabase };
