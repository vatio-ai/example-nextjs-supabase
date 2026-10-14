"use client";

import { mountVatioWidget } from "@vatio-ai/widget";
import { useEffect } from "react";

// The Vatio chat bubble, on every page. Nothing here about who is signed in:
// vatio.yml names the Supabase project (`auth: supabase:`), so the widget reads
// the session this app already keeps in its cookies, and follows sign-ins,
// sign-outs and token refreshes on its own.
export function VatioWidget() {
  useEffect(() => {
    const workspace = process.env.NEXT_PUBLIC_VATIO_WORKSPACE;
    const token = process.env.NEXT_PUBLIC_VATIO_TOKEN;
    if (!workspace || !token) return; // Not configured yet: no bubble.

    const widget = mountVatioWidget({ workspace, token });
    return () => widget.unmount();
  }, []);

  return null;
}
