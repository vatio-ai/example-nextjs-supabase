import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth) {
    return (
      <>
        <h1>Your orders</h1>
        <p>
          <Link href="/login">Sign in</Link> to see your orders.
        </p>
        <p className="muted">
          Or open the chat in the corner. It answers questions about shipping and returns for anyone,
          and looks up your own orders once you are signed in.
        </p>
      </>
    );
  }

  // No `where user_id = …`: Row Level Security returns this user's rows only.
  // The agent's tool (tools/my_orders.yml) makes the same request with the
  // same token, so it sees exactly what this page shows.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, item, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <header>
        <h1>Your orders</h1>
        <p className="muted">
          {auth.claims.email} · <SignOutButton />
        </p>
      </header>

      {error && <p className="error">Could not load your orders: {error.message}</p>}

      {orders && orders.length === 0 && (
        <p className="muted">No orders yet. The README has the SQL that adds a few for your account.</p>
      )}

      {orders && orders.length > 0 && (
        <ul className="orders">
          {orders.map((order) => (
            <li key={order.id}>
              <span>
                <strong>#{order.id}</strong> {order.item}
              </span>
              <span className={`status ${order.status}`}>{order.status}</span>
              <time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString("en")}</time>
            </li>
          ))}
        </ul>
      )}

      <p className="muted">Ask the chat in the corner: “Where is my rain jacket?”</p>
    </>
  );
}
