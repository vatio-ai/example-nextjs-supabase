import type { Metadata } from "next";
import type { ReactNode } from "react";
import { VatioWidget } from "@/components/vatio-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orders · Vatio + Supabase example",
  description: "A Next.js and Supabase app with a Vatio agent that answers about the signed-in user's orders.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <VatioWidget />
      </body>
    </html>
  );
}
