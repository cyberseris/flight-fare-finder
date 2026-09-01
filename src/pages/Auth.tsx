import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/page-meta";

export default function Auth({ mode: initialMode = "signin" }: { mode?: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/app";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  usePageMeta({
    title: mode === "signin" ? "登入 — Flight Price Notifier" : "建立帳號 — Flight Price Notifier",
    description: "Sign in to Flight Price Notifier to watch fares from Taipei.",
  });

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(redirectTo);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "登入失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google 登入失敗，請再試一次");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-[11px] font-medium text-primary-foreground">
              F!
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Flight Price Notifier</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm animate-[rise_0.5s_cubic-bezier(0.32,0.72,0,1)_both] rounded-2xl border border-border bg-card p-6">
          {confirmSent ? (
            <div className="text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-pine/15 font-mono text-sm text-pine">
                ✓
              </span>
              <h1 className="mt-4 text-lg font-semibold">請確認你的信箱</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                我們已寄出確認信到 {email}。點擊信中的連結後即可登入。
              </p>
              <button
                onClick={() => setConfirmSent(false)}
                className="mt-5 text-sm font-medium text-primary hover:underline"
              >
                返回登入
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold tracking-tight">
                {mode === "signin" ? "登入" : "建立帳號"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to watch your fares."
                  : "Sign up to start watching fares."}
              </p>

              <form onSubmit={handleEmail} className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
                  >
                    Password · 密碼
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="至少 6 個字元"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? "請稍候…" : mode === "signin" ? "Sign in / 登入" : "Sign up / 註冊"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  or
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handleGoogle}
                className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-card"
              >
                使用 Google 登入
              </button>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "還沒有帳號？" : "已經有帳號？"}{" "}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === "signin" ? "免費註冊" : "直接登入"}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
