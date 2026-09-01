import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/page-meta";

type Watch = {
  id: string;
  origin: string;
  destination: string;
  destination_name: string;
  target_price: number;
  created_at: string;
};

const DESTINATIONS = [
  { code: "NRT", name: "東京" },
  { code: "KIX", name: "大阪" },
  { code: "ICN", name: "首爾" },
  { code: "BKK", name: "曼谷" },
  { code: "SIN", name: "新加坡" },
  { code: "HKG", name: "香港" },
  { code: "FUK", name: "福岡" },
  { code: "OKA", name: "沖繩" },
];

export default function Dashboard() {
  usePageMeta({
    title: "我的航線 — Flight Price Notifier",
    description: "Your watched flight routes and target prices.",
    robots: "noindex",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [destination, setDestination] = useState("NRT");
  const [targetPrice, setTargetPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const { data: watches, isLoading } = useQuery({
    queryKey: ["watches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watches")
        .select("id, origin, destination, destination_name, target_price, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Watch[];
    },
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(targetPrice);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("請輸入有效的目標價");
      return;
    }
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("請先登入");
      const dest = DESTINATIONS.find((d) => d.code === destination)!;
      const { error } = await supabase.from("watches").insert({
        user_id: user.id,
        origin: "TPE",
        destination: dest.code,
        destination_name: dest.name,
        target_price: price,
      });
      if (error) throw error;
      toast.success(`已開始監看 TPE → ${dest.code}（${dest.name}）`);
      setTargetPrice("");
      await queryClient.invalidateQueries({ queryKey: ["watches"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "新增失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("watches").delete().eq("id", id);
    if (error) {
      toast.error("刪除失敗");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["watches"] });
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
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">
              {sessionData?.user?.email}
            </span>
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
          <h1 className="text-2xl font-semibold tracking-tight">我的監看航線</h1>
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            My watched routes
          </span>
        </div>

        {/* Add watch form */}
        <form
          onSubmit={handleAdd}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <div>
            <label
              htmlFor="origin"
              className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              From
            </label>
            <div
              id="origin"
              className="mt-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-muted-foreground"
            >
              TPE · 台北
            </div>
          </div>
          <div>
            <label
              htmlFor="destination"
              className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              To · 目的地
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} · {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="target"
              className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Target · 目標價 (NT$)
            </label>
            <input
              id="target"
              type="number"
              min={1}
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="7500"
              className="mt-1 block w-36 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "新增中…" : "開始監看"}
          </button>
        </form>

        {/* Watch list */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.6fr] gap-3 border-b border-border bg-card px-5 py-3 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
            <span>Route · 航線</span>
            <span>Target · 目標價</span>
            <span>Status</span>
            <span />
          </div>
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">載入中…</div>
          ) : !watches || watches.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                還沒有監看的航線。在上方新增一條，降價時我們會寄信通知你。
              </p>
            </div>
          ) : (
            watches.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_0.6fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-medium">
                    {w.origin} → {w.destination}
                  </span>
                  <span className="text-xs text-muted-foreground">{w.destination_name}</span>
                </div>
                <span className="font-mono text-sm">NT${w.target_price.toLocaleString()}</span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-foreground/8 px-2.5 py-1 font-mono text-[11px] font-medium text-muted-foreground">
                  監看中
                </span>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="justify-self-end rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  移除
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
