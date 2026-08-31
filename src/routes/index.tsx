import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Price Notifier — 機票降價通知，台北出發" },
      {
        name: "description",
        content:
          "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
      },
      { property: "og:title", content: "Flight Price Notifier — 機票降價通知" },
      {
        property: "og:description",
        content:
          "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Header() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
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
        </Link>
        {signedIn ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            我的航線 <span className="px-1 text-muted-foreground">/</span> Dashboard
          </Link>
        ) : (
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            Sign in <span className="px-1 text-muted-foreground">/</span> 登入
          </Link>
        )}
      </div>
    </header>
  );
}

const WATCHED_ROUTES = [
  {
    route: "TPE → NRT",
    city: "東京",
    current: "NT$7,280",
    target: "7,500",
    status: "✓ 已達價",
    statusClass: "bg-pine/15 text-pine",
  },
  {
    route: "TPE → KIX",
    city: "大阪",
    current: "NT$6,820",
    target: "6,800",
    status: "≈ 臨界",
    statusClass: "bg-butter/25 text-foreground/70",
  },
  {
    route: "TPE → ICN",
    city: "首爾",
    current: "NT$4,590",
    target: "5,000",
    status: "▼ 低於目標",
    statusClass: "bg-primary/10 text-primary",
  },
  {
    route: "TPE → BKK",
    city: "曼谷",
    current: "NT$12,640",
    target: "11,000",
    status: "監看中",
    statusClass: "bg-foreground/8 text-muted-foreground",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-[rise_0.7s_cubic-bezier(0.32,0.72,0,1)_both]">
            <span className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
              Flight Price Notifier
            </span>
            <h1 className="mt-4 max-w-[15ch] text-4xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-5xl">
              設定航線與目標價，
              <br />
              機票降價就通知你
            </h1>
            <p className="mt-4 max-w-[42ch] text-lg text-muted-foreground text-pretty">
              Set a route and a target price — we email you the moment the fare
              drops below your line.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Free · 免費開始
              </Link>
              <a
                href="#how"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="animate-[rise_0.7s_cubic-bezier(0.32,0.72,0,1)_120ms_both] rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
              <span>TPE · 台北</span>
              <span className="inline-flex items-center gap-1 text-pine">
                <span className="size-1.5 rounded-full bg-pine" />
                LIVE
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="font-mono text-xs text-muted-foreground">
                  NRT · 東京
                </div>
                <div className="mt-1 flex items-end gap-3">
                  <span className="font-mono text-5xl font-medium tracking-tight">
                    NT$7,280
                  </span>
                  <span className="font-mono text-sm text-muted-foreground line-through">
                    8,150
                  </span>
                </div>
              </div>
              <span className="inline-flex animate-[pop_0.55s_cubic-bezier(0.32,0.72,0,1)_600ms_both] items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 font-mono text-xs font-medium text-primary">
                ▼ 10.7%
              </span>
            </div>
            <div className="relative mt-4 h-16 overflow-hidden rounded-lg bg-background">
              <svg
                viewBox="0 0 320 64"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,18 C40,12 70,26 100,22 C130,18 150,30 180,34 C210,38 240,44 270,48 L320,52"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-primary/50" />
              <span className="absolute right-2 top-1 font-mono text-[10px] text-primary">
                目標 7,500
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <span className="grid size-8 place-items-center rounded-full bg-pine/15 font-mono text-xs text-pine">
                ✓
              </span>
              <div className="leading-tight">
                <div className="text-sm font-medium">
                  已達目標價 — 已寄出通知
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  just now · 寄到你的信箱
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">三步開始</h2>
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            How it works
          </span>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              key: "(a)",
              title: "設定航線",
              body: "Pick a route from Taipei — Tokyo, Osaka, Seoul, Bangkok and more.",
              delay: "60ms",
            },
            {
              key: "(b)",
              title: "設定目標價",
              body: "Set your ceiling. We track fares around the clock, 24/7.",
              delay: "140ms",
            },
            {
              key: "(c)",
              title: "收到通知",
              body: "The second a fare dips below your line, we email you. Instantly.",
              delay: "220ms",
            },
          ].map((step) => (
            <div
              key={step.key}
              className="animate-[rise_0.6s_cubic-bezier(0.32,0.72,0,1)_both] rounded-xl border border-border bg-card p-5"
              style={{ animationDelay: step.delay }}
            >
              <span className="font-mono text-xs tracking-[0.2em] text-primary">
                {step.key}
              </span>
              <div className="mt-3 text-lg font-semibold">{step.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Watched routes */}
      <section className="mx-auto max-w-6xl px-5 py-6 pb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            正在監看的航線
          </h2>
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Watched routes
          </span>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] gap-3 border-b border-border bg-card px-5 py-3 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
            <span>Route · 航線</span>
            <span>Current</span>
            <span>Target</span>
            <span>Status</span>
          </div>
          {WATCHED_ROUTES.map((r, i) => (
            <div
              key={r.route}
              className={`grid animate-[flip_0.5s_cubic-bezier(0.32,0.72,0,1)_both] grid-cols-[1.4fr_1fr_1fr_0.9fr] items-center gap-3 px-5 py-3.5 ${
                i < WATCHED_ROUTES.length - 1 ? "border-b border-border" : ""
              }`}
              style={{ animationDelay: `${80 + i * 80}ms` }}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-medium">{r.route}</span>
                <span className="text-xs text-muted-foreground">{r.city}</span>
              </div>
              <span className="font-mono text-sm">{r.current}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {r.target}
              </span>
              <span
                className={`inline-flex items-center gap-1 self-center rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ${r.statusClass}`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[34ch]">
              <div className="text-lg font-semibold tracking-tight">
                Flight Price Notifier
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                我們只在你設定的航線真的降價時才寫信給你 — 絕不轟炸信箱。
              </p>
            </div>
            <div className="flex gap-10 font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
              <div className="space-y-2">
                <div className="text-foreground">Product</div>
                <a href="#how" className="block hover:text-primary">
                  How it works
                </a>
                <Link to="/auth" className="block hover:text-primary">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
            <span>© 2026 Flight Price Notifier · 由台北打造</span>
            <span>Prices refresh hourly · 價格每小時更新</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
