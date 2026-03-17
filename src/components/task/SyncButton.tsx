"use client";

/**
 * SyncButton — Notion からタスクを手動同期するボタン。
 * 同期中はスピナーを表示し、エラー時はトースト代わりにアラートを出す。
 */

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function SyncButton() {
  const { syncTasksFromNotion, notionSettings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSettings = notionSettings.api_key && notionSettings.page_id;

  const handleSync = async () => {
    if (!hasSettings) {
      setError("ご褒美設定ページで Notion API キーとページ ID を設定してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await syncTasksFromNotion();
    } catch (e) {
      setError(e instanceof Error ? e.message : "同期に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
          "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        {loading ? "同期中..." : "Notion 同期"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
