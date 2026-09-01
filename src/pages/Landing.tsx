import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Check,
  MapPin,
  MessageCircleMore,
  Plane,
  Search,
  Target,
  TrendingDown,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/page-meta";

const SOFT = "shadow-[0_18px_46px_-22px_rgba(124,78,33,0.28)]";
const SOFT_SM = "shadow-[0_10px_26px_-16px_rgba(124,78,33,0.30)]";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-[0.8rem] font-bold uppercase tracking-[0.16em] text-peach-foreground">
      <span className="h-0.5 w-5 rounded-full bg-primary" aria-hidden="true" />
      {children}
    </span>
  );
}

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
    <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 -rotate-6 place-items-center rounded-[0.7rem] bg-primary text-primary-foreground">
            <Plane className="size-5" strokeWidth={2.2} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[15px] font-extrabold tracking-tight">
              Flight Price Notifier
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.18em] text-muted-foreground">
              機票降價通知
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            運作方式
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            功能
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            定價
          </a>
        </nav>

        <div className="flex items-center gap-3.5">
          {signedIn ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              我的航線
            </Link>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="font-display text-sm font-bold transition-colors hover:text-peach-foreground"
              >
                登入
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                免費開始
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function FareWatchCard() {
  return (
    <div
      className={`animate-[rise_0.7s_cubic-bezier(0.32,0.72,0,1)_120ms_both] rounded-[1.75rem] border border-border bg-card p-6 ${SOFT}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-lg font-extrabold">
          <Plane className="size-[18px] text-pine" strokeWidth={2} />
          TPE → NRT
        </span>
        <span className="flex items-center gap-1.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-pine">
          <span className="size-[7px] animate-pulse rounded-full bg-pine" />
          追蹤中
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        台北 桃園 → 東京 成田 · 過去 30 天最低含稅價
      </p>

      <div className="relative mt-4 rounded-2xl bg-accent/60 p-3.5">
        <span className="absolute right-4 top-3.5 z-10 inline-flex items-center gap-1 rounded-full bg-pine px-2.5 py-1 font-display text-[0.78rem] font-bold text-white shadow-[0_6px_16px_-8px_rgba(40,120,80,0.7)]">
          <TrendingDown className="size-3.5" strokeWidth={2.6} />
          達標了
        </span>
        <svg
          viewBox="0 0 320 180"
          className="block h-auto w-full"
          role="img"
          aria-label="票價折線圖：30 天內從約 5,900 元降到 4,280 元，跌破目標價 4,500 元"
        >
          <line
            x1="8"
            y1="118"
            x2="312"
            y2="118"
            stroke="var(--color-muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="10" y="112" fill="var(--color-muted-foreground)" fontSize="9">
            目標 NT$4,500
          </text>
          <path
            d="M10,44 L46,60 L82,50 L118,86 L154,80 L190,112 L226,100 L262,128 L298,150 L298,170 L10,170 Z"
            fill="var(--color-primary)"
            opacity="0.1"
          />
          <path
            d="M10,44 L46,60 L82,50 L118,86 L154,80 L190,112 L226,100 L262,128 L298,150"
            pathLength={1}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke-dasharray:1] [stroke-dashoffset:1] animate-[draw_1.6s_ease_0.35s_both]"
          />
          <circle
            cx="298"
            cy="150"
            r="11"
            fill="none"
            stroke="var(--color-pine)"
            strokeWidth="2"
            opacity="0.35"
          />
          <circle cx="298" cy="150" r="5" fill="var(--color-pine)" />
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="font-display text-2xl font-extrabold tabular-nums">
          NT$4,280 <span className="text-sm font-medium text-muted-foreground">今天</span>
        </span>
        <span className="text-right text-[0.82rem] text-muted-foreground">
          你的目標 <b className="font-display text-foreground">NT$4,500</b>
          <br />
          省下約 <span className="font-bold text-pine">NT$1,620</span>
        </span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: MapPin,
    title: "選擇航線",
    body: "從台北出發的熱門航線挑一條，例如東京、首爾、大阪。",
  },
  {
    icon: Target,
    title: "設定目標價",
    body: "填一個你願意買單的含稅價格，我們以這條線為準。",
  },
  {
    icon: BellRing,
    title: "收到 Email",
    body: "票價一降到目標，立刻寄信給你，附上訂票連結。",
  },
];

const FEATURES = [
  {
    icon: Search,
    label: "Always-on",
    title: "盯緊熱門航線",
    body: "持續監控台北出發的熱門航線，每天自動抓最低含稅票價，不漏掉任何一次降價。",
  },
  {
    icon: BellRing,
    label: "Target alerts",
    title: "達標自動通知",
    body: "低於你設定的目標價，就寄 Email 提醒你，信裡直接附上立即訂購的連結。",
  },
  {
    icon: Check,
    label: "No lock-in",
    title: "隨時取消",
    body: "月訂閱制，不想用隨時停，沒有綁約、不留下難用的手續。",
  },
];

const PLAN_POINTS = [
  "同時追蹤最多 5 條航線",
  "達標 Email 通知次數不限",
  "信裡直接附訂票連結",
  "一鍵暫停或取消，不留手續",
];

export default function Landing() {
  usePageMeta({
    title: "Flight Price Notifier — 機票降價通知，台北出發",
    description:
      "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops.",
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-[15%] -top-[25%] h-[70%] w-[65%] rounded-full opacity-70 blur-2xl"
          style={{
            background: "radial-gradient(circle at 35% 40%, var(--color-peach), transparent 62%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-[rise_0.7s_cubic-bezier(0.32,0.72,0,1)_both]">
            <Eyebrow>台北出發 · 機票降價通知</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.28] tracking-tight text-balance sm:text-[3.1rem]">
              設定航線與目標價，
              <br />
              機票
              <span className="bg-[linear-gradient(transparent_60%,var(--color-peach)_60%,var(--color-peach)_92%,transparent_92%)] text-primary">
                降價就通知你
              </span>
            </h1>
            <p className="mt-5 max-w-[30em] text-[1.05rem] text-muted-foreground text-pretty">
              選一條你想飛的航線、填一個能接受的價格。我們每天盯著票價，一降到你的目標就寄
              Email，附上立刻訂票的連結。
            </p>
            <p className="mt-3 text-sm text-muted-foreground/80">
              Set a route and a target price — we email you the moment the fare drops.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                to="/sign-up"
                className={`inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${SOFT_SM}`}
              >
                <ArrowRight className="size-[1.1em]" strokeWidth={2.4} />
                免費開始追蹤
              </Link>
              <a
                href="#how"
                className="rounded-full border-2 border-border px-6 py-3 font-display font-bold transition-colors hover:border-primary hover:text-peach-foreground"
              >
                看看怎麼運作
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3.5 text-sm text-muted-foreground">
              <span className="flex" aria-hidden="true">
                {["小", "幫", "手"].map((c, i) => (
                  <span
                    key={c}
                    className="grid size-6 place-items-center rounded-full border-2 border-background bg-peach text-[0.7rem] font-bold text-peach-foreground"
                    style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                  >
                    {c}
                  </span>
                ))}
              </span>
              <span>已經幫旅客盯了 100 條航線</span>
              <span className="size-[5px] rounded-full bg-border" aria-hidden="true" />
              <span>不綁約，隨時取消</span>
            </div>
          </div>

          <FareWatchCard />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance">
            三個步驟，剩下的交給我們
          </h2>
          <p className="mt-2.5 text-muted-foreground">
            設定一次，之後你只要等信。不用每天開比價網站、不用刷票。
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-9 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="animate-[rise_0.6s_cubic-bezier(0.32,0.72,0,1)_both] text-center"
              style={{ animationDelay: `${80 + i * 90}ms` }}
            >
              <div className="relative mx-auto mb-5 grid size-24 place-items-center rounded-full bg-peach text-peach-foreground">
                <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border-[3px] border-background bg-primary font-display text-sm font-extrabold text-primary-foreground">
                  {i + 1}
                </span>
                <step.icon className="size-9" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-lg font-extrabold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-accent/45 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance">
              為「只想要便宜票」的人設計
            </h2>
            <p className="mt-2.5 text-muted-foreground">
              你不在乎哪一天飛，只想用預算內的價格出發 — 這個工具就是為你做的。
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border border-border bg-card p-7 ${SOFT_SM}`}
              >
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-peach text-peach-foreground">
                  <f.icon className="size-6" strokeWidth={1.9} />
                </div>
                <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.08em] text-peach-foreground">
                  {f.label}
                </span>
                <h3 className="mt-1 font-display text-xl font-extrabold">{f.title}</h3>
                <p className="mt-2.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reassurance strip */}
      <div className="bg-peach py-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3.5 px-5 text-center">
          <span className="grid size-7 place-items-center rounded-full bg-pine text-white">
            <Check className="size-4" strokeWidth={3} />
          </span>
          <p className="font-display text-lg font-bold text-peach-foreground">
            月訂閱制 · 隨時取消 · 不綁約
          </p>
        </div>
      </div>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance">
            一個方案，夠用就好
          </h2>
          <p className="mt-2.5 text-muted-foreground">
            一次追蹤多條航線，通知次數不限。先免費試用，覺得值得再付。
          </p>
        </div>

        <div
          className={`relative mx-auto max-w-md rounded-[1.75rem] border border-border bg-card p-9 text-center ${SOFT}`}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 font-display text-[0.75rem] font-bold uppercase tracking-[0.08em] text-primary-foreground">
            最受歡迎
          </span>
          <div className="mt-2 font-display text-5xl font-extrabold tabular-nums">
            NT$99<span className="text-base font-medium text-muted-foreground"> / 月</span>
          </div>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">前 14 天免費 · 隨時取消</p>
          <ul className="mb-7 flex flex-col gap-3 text-left">
            {PLAN_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[0.95rem]">
                <Check className="mt-1 size-[18px] shrink-0 text-pine" strokeWidth={3} />
                {p}
              </li>
            ))}
          </ul>
          <Link
            to="/sign-up"
            className={`flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${SOFT_SM}`}
          >
            免費試用 14 天
          </Link>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">不需要信用卡即可開始試用。</p>
      </section>

      {/* Final CTA */}
      <section className="bg-[oklch(0.24_0.02_50)] py-24 text-center text-[oklch(0.95_0.012_84)]">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance text-white">
            下一趟旅行，等它降價就好
          </h2>
          <p className="mx-auto mt-3.5 max-w-[34em] text-white/70">
            現在設定第一條航線，把刷票這件事從你的待辦清單刪掉。
          </p>
          <Link
            to="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground shadow-[0_14px_34px_-14px_rgba(232,108,29,0.8)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowRight className="size-[1.1em]" strokeWidth={2.4} />
            免費開始追蹤
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent/45 py-14">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-7 -rotate-6 place-items-center rounded-[0.6rem] bg-primary text-primary-foreground">
                <Plane className="size-4" strokeWidth={2.2} />
              </span>
              <span className="font-display font-extrabold">Flight Price Notifier</span>
            </Link>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <a href="#how" className="hover:text-peach-foreground">
                運作方式
              </a>
              <a href="#features" className="hover:text-peach-foreground">
                功能
              </a>
              <a href="#pricing" className="hover:text-peach-foreground">
                定價
              </a>
              <Link to="/sign-in" className="hover:text-peach-foreground">
                登入
              </Link>
            </nav>
          </div>
          <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © 2026 Flight Price Notifier
          </p>
        </div>
      </footer>

      {/* Floating helper */}
      <a
        href="#how"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-border bg-card py-2.5 pl-2.5 pr-4 font-display text-sm font-bold ${SOFT} transition-transform hover:-translate-y-0.5`}
      >
        <span className="grid size-7 place-items-center rounded-full bg-peach text-peach-foreground">
          <MessageCircleMore className="size-4" strokeWidth={2.2} />
        </span>
        <span className="hidden sm:inline">第一次來？看看怎麼用</span>
      </a>
    </div>
  );
}
