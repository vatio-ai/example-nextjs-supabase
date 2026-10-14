import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase in server components and route handlers, as the signed-in user:
// every query runs under Row Level Security with their session.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // A server component cannot set cookies. proxy.ts refreshes the
            // session on every request, so there is nothing to write here.
          }
        },
      },
    },
  );
}
