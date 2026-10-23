# Next.js + Supabase + Vatio

A small store app where customers sign in with Supabase and see their orders,
with a [Vatio](https://vatio.ai) agent in the corner that answers about those
same orders. It is the smallest real app with a Vatio agent wired in: read it,
copy from it, or point your coding agent at it.

- **The app:** Next.js (App Router, TypeScript), Supabase Auth with an email
  magic link, and one `orders` table with Row Level Security.
- **The agent:** `vatio.yml`, one tool and one knowledge entry, the files
  `/vatio-init` writes.

## What the agent can do

- **Look up the customer's own orders** with `my_orders`: what they ordered,
  its status and when. The tool is `access: private`, so it runs only for a
  visitor signed in with Supabase. It calls Supabase with that visitor's own
  token, so Row Level Security gives it the rows the app shows them and
  nobody else's.
- **Answer shipping and returns questions** from the `policies` knowledge
  base, signed in or not.

It cannot change anything: there is no tool that writes, and the table has no
insert, update or delete policy. Ask about an order while signed out and it
asks you to sign in. Once you do, the same conversation carries on, now
knowing who you are.

## How it fits together

```text
Browser ──── email magic link ─────────────────▶ Supabase Auth
   │  session cookie (sb-<ref>-auth-token) ◀────────────┘
   │
   ├─ app/page.tsx ──── the user's token ─────▶ Supabase /rest/v1/orders
   │                                               ▲   RLS: user_id = auth.uid()
   └─ Vatio widget ──── the same token ─▶ Vatio    │
      (app/layout.tsx)                     agent ──┤ my_orders: Bearer $auth.token
                                             └──── knowledge_lookup ─▶ policies
```

- `vatio.yml` names the Supabase project (`auth: supabase:`). Vatio checks
  each visitor's access token with the project's public signing keys. It never
  sees a password or a refresh token, and cannot create a token.
- The widget reads the session where `@supabase/ssr` keeps it, in cookies.
  `components/vatio-widget.tsx` mounts it and tells it nothing about the user.
- `proxy.ts` refreshes an expired session on each request, and supabase-js
  refreshes it while a signed-in page is open. The widget picks up each new
  token.

## Run it locally

You need Node.js 20.9 or newer and a Supabase project.

1. **Set up Supabase.**
   - Run `supabase/migrations/0001_orders.sql` in the dashboard's SQL Editor
     (or `supabase db push` with the Supabase CLI).
   - Under **Authentication → URL Configuration**, add
     `http://localhost:3000/**` to the Redirect URLs.
   - Vatio needs the project to sign with an asymmetric key (ES256 or RS256).
     If it is still on the legacy JWT secret: **Project Settings → JWT Keys**,
     migrate, then rotate to the ES256 key. See
     [Supabase in the Vatio docs](https://vatio.ai/docs/integrations/supabase).
2. **Fill in the environment.** `cp .env.example .env.local`, then set the
   Supabase URL and anon key. The Vatio values come in the next section;
   without them the app runs with no chat bubble.
3. **Start it.**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000, sign in with your email, and open the link in
   the same browser.
4. **Add some orders.** In the SQL Editor, with the email you signed in with:

   ```sql
   insert into public.orders (user_id, item, status, created_at)
   select users.id, sample.item, sample.status, now() - sample.age
   from auth.users,
     (values ('Rain jacket', 'shipped', interval '2 days'),
             ('Trail running shoes', 'delivered', interval '9 days'),
             ('Water bottle', 'processing', interval '3 hours')) as sample (item, status, age)
   where users.email = 'you@example.com';
   ```

## Deploy this agent

`vatio` is `npx @vatio-ai/cli@latest`, or install it once with
`npm install -g @vatio-ai/cli@latest`. From this directory, with `.env.local`
filled in, and `your-workspace` in `vatio.yml` replaced by a slug of your own:

```bash
vatio push
vatio auth --supabase
vatio kb create policies
vatio kb write policies shipping-and-returns kb/policies/shipping-and-returns.md
vatio push
```

The first `push` signs you in and creates the workspace, then stops, because
the Supabase URL in `vatio.yml` is still a placeholder. `auth --supabase`
reads your project from `.env.local`, writes it into `vatio.yml`, and sets the
`SUPABASE_URL` and `SUPABASE_ANON_KEY` secrets the tool reads. The knowledge
base has to exist before a push that names it. The second `push` deploys to
preview and prints a `Try it:` link to the Test page in the Vatio inbox.

### Put the chat in the app

The widget needs a publishable key (`vatpub_…`), and each key works only
from the origins it lists. For this app on your machine, a preview key for
`http://localhost:3000`:

```bash
vatio keys create publishable --env preview --label local --origin http://localhost:3000
```

Put the key it prints in `.env.local` as `NEXT_PUBLIC_VATIO_TOKEN`, your slug
as `NEXT_PUBLIC_VATIO_WORKSPACE`, and restart `npm run dev`. To change a
key's origins later: `vatio keys origins PREFIX URL...`.

When it is ready for customers, `vatio publish` takes preview live, and a live
key lists your site's origin:
`vatio keys create publishable --label website --origin https://your-app.com`. For
WhatsApp and Instagram, add your deployed login page:
`vatio auth --supabase --sign-in-url https://your-app.com/login`.

## Your own agent

In your own app's project, two lines: run

```bash
npx @vatio-ai/skills
```

then `/vatio-init` in Claude Code (in Cursor or Codex, ask it to use
vatio-init). Your coding agent reads the app, proposes an agent, and writes
files like the ones here for it. Run in this directory, it finds `vatio.yml`
and treats this agent as one that already exists; delete `vatio.yml`, `tools/`
and `kb/` first to start over.

## Files

| Path | What it is |
|---|---|
| `app/page.tsx` | `/`: a sign-in link, or your orders |
| `app/login/` | `/login`: the magic-link form |
| `app/auth/callback/route.ts` | Where the magic link lands; sets the session cookie |
| `app/layout.tsx`, `components/vatio-widget.tsx` | The Vatio widget, on every page |
| `lib/supabase/`, `proxy.ts` | Supabase clients, and the session refresh on each request |
| `supabase/migrations/0001_orders.sql` | The `orders` table and its Row Level Security |
| `vatio.yml` | The agent: instructions, tools, knowledge and `auth: supabase:` |
| `tools/my_orders.yml` | The private tool: the visitor's orders from Supabase's REST API |
| `kb/policies/shipping-and-returns.md` | The knowledge entry, uploaded with `vatio kb write` |

Docs: [Supabase](https://vatio.ai/docs/integrations/supabase) ·
[Web widget](https://vatio.ai/docs/channels/widget) ·
[Tools](https://vatio.ai/docs/tools) ·
[Knowledge](https://vatio.ai/docs/knowledge)

## License

MIT. See [LICENSE](LICENSE).
