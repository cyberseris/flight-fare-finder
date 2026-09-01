import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

type AuthState = "checking" | "authed" | "anon";

/**
 * Client-side route guard — the SPA replacement for the TanStack Start
 * `_authenticated` layout's `beforeLoad` redirect. Unauthenticated visitors are
 * sent to `/sign-in` with the attempted path preserved in `?redirect=`.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<AuthState>("checking");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState(data.user ? "authed" : "anon");
    });
    return () => {
      active = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        載入中…
      </div>
    );
  }

  if (state === "anon") {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
