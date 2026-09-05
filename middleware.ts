import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip everything that can never need a session check:
     * - _next/static, _next/image  (build output)
     * - favicon, robots, sitemap, manifest  (crawler + browser metadata)
     * - any request for a static asset by extension
     *
     * Keeping these out of the matcher means the middleware function is not
     * even invoked for them, rather than invoked and returned from early.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf)$).*)",
  ],
};
