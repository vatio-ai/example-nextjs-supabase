-- One table, one rule: a signed-in user reads their own orders and nobody
-- else's. The app and the Vatio agent both query it with the user's own access
-- token, so this policy is what keeps each of them to that user's rows.

create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item text not null,
  status text not null default 'processing'
    check (status in ('processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

create policy "Users read their own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Reading only: there is no insert, update or delete policy, so neither the
-- app nor the agent can change an order. Signed-out requests (the anon role)
-- get nothing at all.
grant select on public.orders to authenticated;
