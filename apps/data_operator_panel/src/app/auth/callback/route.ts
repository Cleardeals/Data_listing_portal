import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the code and next URL from the query params
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (!code) {
      throw new Error("No code provided");
    }

    // Create a base response
    const baseUrl = new URL("/", request.url);
    const response = NextResponse.redirect(baseUrl);

    // Create a Supabase client with cookie management
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
              // Make sure cookies work on this domain
              sameSite: "lax",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            });
          },
          remove(name: string, options: any) {
            response.cookies.delete(name);
          },
        },
      }
    );

    // Exchange the code for a session
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Create a response redirecting to the intended destination
      const redirectUrl = new URL(next, request.url);
      const finalResponse = NextResponse.redirect(redirectUrl);

      // Copy over all cookies to the final response
      response.cookies.getAll().forEach((cookie) => {
        finalResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          path: cookie.path,
          sameSite: cookie.sameSite,
          secure: cookie.secure,
        });
      });

      return finalResponse;
    }

    throw error;
  } catch (error) {
    console.error("Auth error:", error);
    const errorUrl = new URL("/auth/auth-error", request.url);
    if (error instanceof Error) {
      errorUrl.searchParams.set("error", error.message);
    }
    return NextResponse.redirect(errorUrl);
  }
}
