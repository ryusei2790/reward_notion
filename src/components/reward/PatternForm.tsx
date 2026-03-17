"use client";

/**
 * PatternForm — ご褒美パターン（min〜maxの完了数）を登録するフォーム。
 */

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function PatternForm() {
  const { addPattern } = useAppContext();
  const [min, setMin] = useState(3);
  const [max, setMax] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (min > max) {
      setError("最小値は最大値以下にしてください");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await addPattern({ min_count: min, max_count: max });
      setMin(3);
      setMax(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* 最小値 */}
        <label className="text-xs text-zinc-500">最小</label>
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Math.max(1, Number(e.target.value)))}
          min={1}
          className={cn(
            "w-16 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2",
            "text-sm text-zinc-100 text-center focus:border-indigo-500 focus:outline-none"
          )}
        />

        <span className="text-zinc-500">〜</span>

        {/* 最大値 */}
        <label className="text-xs text-zinc-500">最大</label>
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(Math.max(1, Number(e.target.value)))}
          min={1}
          className={cn(
            "w-16 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2",
            "text-sm text-zinc-100 text-center focus:border-indigo-500 focus:outline-none"
          )}
        />

        <span className="text-xs text-zinc-500">タスク完了でご褒美</span>

        {/* 追加ボタン */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white",
            "transition-colors hover:bg-indigo-500 disabled:opacity-50"
          )}
        >
          追加
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
