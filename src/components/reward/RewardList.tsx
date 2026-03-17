"use client";

/**
 * RewardList — 登録済みご褒美の一覧と削除。
 */

import { Trash2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

export function RewardList() {
  const { rewards, removeReward } = useAppContext();

  if (rewards.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        ご褒美がまだ登録されていません。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rewards.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5"
        >
          <span className="text-sm text-zinc-200">{r.content}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">重み: {r.weight}</span>
            <button
              onClick={() => removeReward(r.id)}
              className="text-zinc-600 transition-colors hover:text-red-400"
              aria-label="削除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
