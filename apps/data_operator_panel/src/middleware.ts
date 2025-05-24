import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create a response early so we can modify its cookies
  const response = NextResponse.next();

  // Allow auth callback URLs and static files to pass through without redirect
  if (
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not logged in and trying to access protected routes
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in and trying to access auth pages
  if (
    session &&
    (request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/signup"))
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
