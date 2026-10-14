import { createBrowserClient } from "@supabase/ssr";

// Supabase in the browser. @supabase/ssr keeps the session in cookies, which
// is where the server components read it, and where the Vatio widget does too.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
