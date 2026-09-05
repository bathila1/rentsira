import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/utils/seo";

/**
 * Only same-site paths are accepted as a post-login destination.
 *
 * Rejecting anything that does not start with a single "/" blocks the classic
 * open-redirect payloads — "//evil.com" (protocol-relative) and
 * "https://evil.com" — from being handed to us in the `next` parameter.
 */
function safeNext(value: string | null): string {
  const fallback = "/seller/dashboard";
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  // Backslashes are normalised to slashes by some browsers.
  if (value.includes("\\")) return fallback;
  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${SITE_URL}${next}`);
    }
    console.error("Auth callback failed:", error.message);
  }

  return NextResponse.redirect(`${SITE_URL}/login?error=auth_failed`);
}
