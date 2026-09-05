import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/page-meta";

// Public HTTP API (no auth) fronting the flight-save-subscription /
// flight-list-subscriptions Lambdas. Not a secret — the browser holds no
// AWS credentials, it only ever talks to this API Gateway endpoint.
const API_BASE = "https://teujqqmjpi.execute-api.us-east-1.amazonaws.com";

type PlanName = "tokyo" | "seoul" | "london";

type Plan = {
  name: PlanName;
  label: string;
  route: string;
  hint: string;
};

const PLANS: Plan[] = [
  { name: "tokyo", label: "台北 ➛ 東京", route: "TPE-TYO", hint: "目前最低約 NT$9,325（參考）" },
  { name: "seoul", label: "台北 ➛ 首爾", route: "TPE-SEL", hint: "目前最低約 NT$5,989（參考）" },
  { name: "london", label: "台北 ➛ 倫敦", route: "TPE-LON", hint: "目前最低約 NT$30,924（參考）" },
];

type Subscription = {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: string;
};

export default function Dashboard() {
  usePageMeta({
    title: "我的航線 — Flight Price Notifier",
    description: "Your watched flight routes and target prices.",
    robots: "noindex",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [targets, setTargets] = useState<Record<PlanName, string>>({
    tokyo: "",
    seoul: "",
    london: "",
  });
  const [savingPlan, setSavingPlan] = useState<PlanName | null>(null);
  const shownPurchaseToast = useRef(false);

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const email = sessionData?.user?.email;

  const { data: subscriptions } = useQuery({
    queryKey: ["subscriptions", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email!)}`);
      if (!res.ok) throw new Error("讀取訂閱狀態失敗");
      const data = await res.json();
      return data.subscriptions as Subscription[];
    },
  });

  // ECPay's OrderResultURL bounces the browser back here with ?purchase=success|failed.
  useEffect(() => {
    if (shownPurchaseToast.current) return;
    const purchase = searchParams.get("purchase");
    if (!purchase) return;
    shownPurchaseToast.current = true;
    if (purchase === "success") {
      toast.success("付款成功，訂閱已啟用！");
    } else if (purchase === "failed") {
      toast.error("付款未完成，請重新嘗試訂閱");
    }
    if (email) {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    }
    const next = new URLSearchParams(searchParams);
    next.delete("purchase");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, email]);

  const subsByPlan = new Map((subscriptions ?? []).map((s) => [s.plan_name, s] as const));

  async function handleSubscribe(plan: Plan) {
    if (!email) return;
    const raw = targets[plan.name];
    const price = Number(raw);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("請輸入有效的目標價");
      return;
    }
    setSavingPlan(plan.name);
    try {
      const res = await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan_name: plan.name, target_price: price }),
      });
      if (!res.ok) throw new Error("訂閱失敗，請稍後再試");

      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("text/html")) {
        // New / lapsed subscription: server returned an auto-submitting ECPay
        // checkout form. Swap the whole document for it so it can POST itself
        // straight to ECPay's hosted payment page.
        const html = await res.text();
        document.open();
        document.write(html);
        document.close();
        return;
      }

      // Already active / cancelled-in-grace: in-place target-price update, no re-payment.
      toast.success(`已更新 ${plan.label} 的目標價`);
      setTargets((t) => ({ ...t, [plan.name]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "訂閱失敗");
    } finally {
      setSavingPlan(null);
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 -rotate-6 place-items-center rounded-[0.7rem] bg-primary text-primary-foreground">
              <Plane className="size-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-[15px] font-extrabold tracking-tight">
              Flight Price Notifier
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full bg-secondary px-4 py-2 font-display text-sm font-bold text-secondary-foreground transition-colors hover:bg-muted"
          >
            Sign out / 登出
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Hi {email}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          選擇航線並設定目標價，
          <span className="rounded bg-accent px-1 py-0.5 font-medium text-accent-foreground">
            訂閱 NT$300/月
          </span>
          後，達標時我們會寄 Email 通知你。
          <br />
          Pick a route, set a target price, and subscribe (NT$300/month) — we'll email you when fare
          drops to your budget.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const sub = subsByPlan.get(plan.name);
            const isSaving = savingPlan === plan.name;

            return (
              <div key={plan.name} className="rounded-2xl bg-peach p-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-peach-foreground">
                  {plan.label}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{plan.hint}</p>

                {sub && (
                  <p className="mt-4 font-mono text-sm">
                    目前目標價：
                    <span className="font-semibold">NT${sub.target_price.toLocaleString()}</span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label
                      htmlFor={`target-${plan.name}`}
                      className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground"
                    >
                      目標價 Target price (NT$)
                    </label>
                    <input
                      id={`target-${plan.name}`}
                      type="number"
                      min={1}
                      value={targets[plan.name]}
                      onChange={(e) => setTargets((t) => ({ ...t, [plan.name]: e.target.value }))}
                      placeholder={sub ? String(sub.target_price) : "9000"}
                      className="mt-1 block w-32 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isSaving}
                    className="rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSaving ? "處理中…" : "訂閱並付款"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
