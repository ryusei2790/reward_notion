"use client";

/**
 * RewardForm — ご褒美を新規登録するフォーム。
 * 内容（テキスト）と重み（1〜10の数値）を入力して送信する。
 */

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function RewardForm() {
  const { addReward } = useAppContext();
  const [content, setContent] = useState("");
  const [weight, setWeight] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addReward({ content: content.trim(), weight });
      setContent("");
      setWeight(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        {/* ご褒美テキスト */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="例: チョコを食べる"
          className={cn(
            "flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2",
            "text-sm text-zinc-100 placeholder-zinc-500",
            "focus:border-indigo-500 focus:outline-none"
          )}
          required
        />

        {/* 重み */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-zinc-500 whitespace-nowrap">重み</label>
          <input
            type="number"
            value={weight}
            onChange={(e) =>
              setWeight(Math.min(10, Math.max(1, Number(e.target.value))))
            }
            min={1}
            max={10}
            className={cn(
              "w-16 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2",
              "text-sm text-zinc-100 text-center",
              "focus:border-indigo-500 focus:outline-none"
            )}
          />
        </div>

        {/* 追加ボタン */}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className={cn(
            "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white",
            "transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          追加
        </button>
      </div>
    </form>
  );
}
