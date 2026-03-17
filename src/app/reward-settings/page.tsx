"use client";

/**
 * ご褒美設定ページ（/reward-settings）。
 * - Notion 連携設定（API Key / Page ID）
 * - ご褒美の登録・一覧・削除
 * - ご褒美パターンの登録・一覧・削除
 */

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { RewardForm } from "@/components/reward/RewardForm";
import { RewardList } from "@/components/reward/RewardList";
import { PatternForm } from "@/components/reward/PatternForm";
import { PatternList } from "@/components/reward/PatternList";
import { cn } from "@/lib/utils";

export default function RewardSettingsPage() {
  const { notionSettings, saveNotionSettings, isDbReady } = useAppContext();
  const [apiKey, setApiKey] = useState(notionSettings.api_key);
  const [pageId, setPageId] = useState(notionSettings.page_id);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // DB 初期化後に設定値を反映
  // （初回レンダリング時は空文字のため、isDbReady が true になったタイミングで更新）
  const handleSaveNotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveNotionSettings({ api_key: apiKey, page_id: pageId });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-bold text-zinc-100">ご褒美設定</h1>

      {/* ===== Notion 連携設定 ===== */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Notion 連携
        </h2>
        <form onSubmit={handleSaveNotion} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Notion API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_..."
              className={cn(
                "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2",
                "text-sm text-zinc-100 placeholder-zinc-600",
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Notion Page ID</label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={cn(
                "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2",
                "text-sm text-zinc-100 placeholder-zinc-600",
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !isDbReady}
              className={cn(
                "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white",
                "transition-colors hover:bg-indigo-500 disabled:opacity-50"
              )}
            >
              {saving ? "保存中..." : "保存"}
            </button>
            {saved && (
              <span className="text-xs text-emerald-400">保存しました</span>
            )}
          </div>
        </form>
      </section>

      {/* ===== ご褒美登録 ===== */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          ご褒美
        </h2>
        <div className="flex flex-col gap-4">
          <RewardForm />
          <RewardList />
        </div>
      </section>

      {/* ===== パターン登録 ===== */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          ご褒美パターン
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          何タスク完了したらご褒美を出すかの「範囲」を登録します。複数登録するとランダムに選ばれます。
        </p>
        <div className="flex flex-col gap-4">
          <PatternForm />
          <PatternList />
        </div>
      </section>
    </div>
  );
}
