import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/page-meta";

// Public HTTP API (no auth) fronting the flight-save-subscription /
// flight-list-subscriptions Lambdas. Not a secret — the browser holds no
// AWS credentials, it only ever talks to this API Gateway endpoint.
const API_BASE = "https://teujqqmjpi.execute-api.us-east-1.amazonaws.com";

type PlanName = "tokyo" | "seoul";

type Plan = {
  name: PlanName;
  label: string;
  route: string;
  hint: string;
};

const PLANS: Plan[] = [
  { name: "tokyo", label: "台北 ✈ 東京", route: "TPE-TYO", hint: "目前最低約 NT$9,325" },
  { name: "seoul", label: "台北 ✈ 首爾", route: "TPE-SEL", hint: "目前最低約 NT$5,989" },
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
  const [targets, setTargets] = useState<Record<PlanName, string>>({ tokyo: "", seoul: "" });
  const [savingPlan, setSavingPlan] = useState<PlanName | null>(null);

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const email = sessionData?.user?.email;

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email!)}`);
      if (!res.ok) throw new Error("讀取訂閱狀態失敗");
      const data = await res.json();
      return data.subscriptions as Subscription[];
    },
  });

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
      toast.success(`已開始追蹤 ${plan.label}`);
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-[11px] font-medium text-primary-foreground">
              F!
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-semibold tracking-tight">
                Flight Price Notifier
              </span>
              <span className="mt-0.5 block font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                機票降價通知
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">{email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">我的航線</h1>
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            My routes
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          選擇航線並設定目標價，機票降到目標以下時會寄信通知你。
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const sub = subsByPlan.get(plan.name);
            const isSaving = savingPlan === plan.name;
            return (
              <div
                key={plan.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{plan.label}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.hint}</p>
                  </div>
                  {sub && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] font-medium text-accent">
                      已訂閱
                    </span>
                  )}
                </div>

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
                      className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
                    >
                      目標價 (NT$)
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
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isSaving ? "處理中…" : sub ? "更新目標價" : "開始追蹤"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && email && (
          <p className="mt-4 text-sm text-muted-foreground">載入訂閱狀態中…</p>
        )}
      </main>
    </div>
  );
}
