import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes that require a logged-in user. */
const PROTECTED_PREFIXES = ["/seller", "/admin"];

/** Routes a logged-in user should be bounced away from. */
const AUTH_PREFIXES = ["/login", "/register", "/get-started"];

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@renta.lk";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Maintenance Mode ───
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    if (pathname !== "/maintenance") {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  /**
   * Public pages skip Supabase entirely.
   *
   * Previously every request — homepage, listings, sitemap, images — built a
   * Supabase client and resolved a session before anything could render. None
   * of those pages branch on the user, so that work was pure latency on the
   * hottest paths on the site.
   *
   * The trade-off is that the auth cookie is no longer refreshed while a signed
   * in user browses public pages. That is fine: the refresh happens the moment
   * they touch /seller or /admin, which is the only place the session is used.
   */
  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /**
   * getUser(), not getSession().
   *
   * getSession() decodes whatever is in the cookie without checking the
   * signature, so a hand-crafted cookie satisfies it. getUser() verifies the
   * token with the auth server. That costs a network call, which is exactly why
   * this now only runs on the handful of routes that gate on identity.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Admin area is restricted to the single admin address. The /admin layout
  // checks this too; doing it here as well stops non-admins from reaching the
  // route at all.
  if (pathname.startsWith("/admin") && user?.email !== ADMIN_EMAIL) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
