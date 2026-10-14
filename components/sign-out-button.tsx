"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  // While this page is open, supabase-js refreshes the access token before it
  // expires and writes it back to the session cookie, where the Vatio widget
  // picks it up. Signing out clears the cookie and re-renders the page.
  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <button type="button" className="link" onClick={() => createClient().auth.signOut()}>
      Sign out
    </button>
  );
}
