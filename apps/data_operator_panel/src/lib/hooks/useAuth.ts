"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      if (session?.user) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signOut,
    supabase,
  };
}
