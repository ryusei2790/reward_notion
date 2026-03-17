"use client";

/**
 * Header — アプリ共通ヘッダー。
 * ナビゲーション（ホーム / ご褒美設定）と現在の進捗バーを表示する。
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Gift, ListTodo } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { progress, isDbReady } = useAppContext();

  /** 進捗のパーセンテージ（0〜100） */
  const progressPct = isDbReady
    ? Math.min(
        Math.round((progress.done_count / progress.target_count) * 100),
        100
      )
    : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* ロゴ */}
        <span className="text-lg font-semibold tracking-tight text-zinc-100">
          Rewardo
        </span>

        {/* ナビゲーション */}
        <nav className="flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>
            <ListTodo size={16} />
            <span>タスク</span>
          </NavLink>
          <NavLink href="/reward-settings" active={pathname === "/reward-settings"}>
            <Gift size={16} />
            <span>ご褒美設定</span>
          </NavLink>
        </nav>
      </div>

      {/* 進捗バー */}
      <div className="h-0.5 w-full bg-zinc-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
}

// -----------------------------------------------
// 内部コンポーネント
// -----------------------------------------------

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      )}
    >
      {children}
    </Link>
  );
}
