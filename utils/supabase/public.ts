import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for reading PUBLIC data on the server.
 *
 * Why this exists: utils/supabase/server.ts calls `cookies()`, and any page
 * that touches cookies is forced into dynamic rendering by Next.js. That meant
 * the homepage, the listing pages and even the sitemap re-queried the database
 * on every single request, no matter what `revalidate` said.
 *
 * Public listing pages do not depend on who is viewing them, so they do not
 * need the visitor's session. Reading through the anon key with no cookies lets
 * those pages be prerendered and revalidated on a schedule instead.
 *
 * Only use this for data that is safe for anyone to read — it carries no user
 * identity, so row level security sees an anonymous request.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
