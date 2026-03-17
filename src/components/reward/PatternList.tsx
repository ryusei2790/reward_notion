"use client";

/**
 * PatternList — 登録済みご褒美パターンの一覧と削除。
 */

import { Trash2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

export function PatternList() {
  const { patterns, removePattern } = useAppContext();

  if (patterns.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        パターンがまだ登録されていません。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {patterns.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5"
        >
          <span className="text-sm text-zinc-200">
            {p.min_count} 〜 {p.max_count} タスク完了でご褒美
          </span>
          <button
            onClick={() => removePattern(p.id)}
            className="text-zinc-600 transition-colors hover:text-red-400"
            aria-label="削除"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
