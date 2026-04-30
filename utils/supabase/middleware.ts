import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {

  // ─── Maintenance Mode ───
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    if (request.nextUrl.pathname !== '/maintenance') {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
  // ─── Maintenance Mode End ───

  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ─── Use getSession instead of getUser to avoid network call ───
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // Logic: If no user and trying to access /seller, redirect to login
  if (!user && request.nextUrl.pathname.startsWith("/seller")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  //next v -  i will uncomment this part when im gonna verify users manually //
  // if (user && (request.nextUrl.pathname.startsWith("/seller/vehicles"))) {
  //   const { data: profileData, error } = await supabase
  //     .from("profiles")
  //     .select("user_status")
  //     .eq("id", user.id)
  //     .single();
  //   if (error) {
  //     console.error("Error fetching profile:", error.message);
  //     return;
  //   }
  //   if (profileData) {
  //     console.log("User Status:", profileData.user_status);
  //     const user_status = profileData.user_status
  //     if (user_status === "pending") {
  //       const url = request.nextUrl.clone();
  //       url.pathname = "/seller/dashboard/admin-verification/pending";
  //       return NextResponse.redirect(url);
  //     }
  //   }
  // }
  //next v end

  //if logged in do not show login and register pages redirect to seller/dashboard instead
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register") ||
      request.nextUrl.pathname.startsWith("/get-started"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}