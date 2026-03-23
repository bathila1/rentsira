import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options),
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

  // This will refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // console.log("Middleware Check - User Found:", user ? user.email : "NO USER");

  // Logic: If no user and trying to access /seller, redirect to login
  if (!user && request.nextUrl.pathname.startsWith("/seller")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  //if logged in do not show login and register pages redirect to seller/dashboard instead
  if (
    (user &&
      (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")  || request.nextUrl.pathname.startsWith("/get-started")) )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/seller/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
