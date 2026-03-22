import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const normalizeUrl = (value?: string) => {
  if (!value) return null;
  const candidate = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  try { return new URL(candidate).toString().replace(/\/$/, ""); }
  catch { return null; }
};

const supabaseUrl = normalizeUrl(rawUrl);

if (!supabaseUrl || !anonKey)
  console.warn("[Supabase] Missing credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");

export const supabase = createClient(supabaseUrl ?? "https://placeholder.supabase.co", anonKey ?? "placeholder-key");