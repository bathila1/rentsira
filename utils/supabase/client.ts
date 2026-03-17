import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Logic: This creates a Supabase client that works in the browser
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}