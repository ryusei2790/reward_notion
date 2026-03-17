"use client";

/**
 * AppContext — アプリ全体のデータ統合管理。
 *
 * PGlite（IndexedDB）から読み書きするすべての状態を一元管理する。
 * 子コンポーネントは useAppContext() フックで必要なデータと操作を取得する。
 *
 * 初期化フロー：
 *   1. マウント時に PGlite を起動し、全テーブルの初期データを読み込む
 *   2. 以降の変更は DB と state の両方に書き込む（楽観的更新）
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import type {
  Task,
  Reward,
  RewardPattern,
  Progress,
  NotionSettings,
  RewardInput,
  RewardPatternInput,
} from "@/types";
import * as db from "@/lib/db";
import { pickTargetCount, pickReward } from "@/lib/reward";

// -----------------------------------------------
// Context 型定義
// -----------------------------------------------

interface AppContextValue {
  // --- 状態 ---
  tasks: Task[];
  rewards: Reward[];
  patterns: RewardPattern[];
  progress: Progress;
  notionSettings: NotionSettings;
  isDbReady: boolean;

  /** ご褒美発動時に設定される。モーダルで表示後に null に戻す */
  pendingReward: Reward | null;

  // --- タスク操作 ---
  syncTasksFromNotion: () => Promise<void>;
  completeTask: (taskId: string, blockId: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;

  // --- ご褒美操作 ---
  addReward: (input: RewardInput) => Promise<void>;
  removeReward: (id: string) => Promise<void>;

  // --- パターン操作 ---
  addPattern: (input: RewardPatternInput) => Promise<void>;
  removePattern: (id: string) => Promise<void>;

  // --- Notion 設定 ---
  saveNotionSettings: (settings: NotionSettings) => Promise<void>;

  // --- ご褒美モーダル ---
  dismissReward: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// -----------------------------------------------
// Provider
// -----------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDbReady, setIsDbReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [patterns, setPatterns] = useState<RewardPattern[]>([]);
  const [progress, setProgress] = useState<Progress>({
    done_count: 0,
    target_count: 5,
  });
  const [notionSettings, setNotionSettings] = useState<NotionSettings>({
    api_key: "",
    page_id: "",
  });
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);

  // --- DB 初期化 & データ読み込み ---
  useEffect(() => {
    (async () => {
      // PGlite を起動してスキーマを初期化（getDb() 内で行う）
      const [t, r, p, prog, ns] = await Promise.all([
        db.getTasks(),
        db.getRewards(),
        db.getRewardPatterns(),
        db.getProgress(),
        db.getNotionSettings(),
      ]);
      setTasks(t);
      setRewards(r);
      setPatterns(p);
      setProgress(prog);
      setNotionSettings(ns);
      setIsDbReady(true);
    })();
  }, []);

  // -----------------------------------------------
  // タスク操作
  // -----------------------------------------------

  /**
   * Notion API 経由でタスクを取得し、DB にキャッシュする。
   * 既存タスクはすべて削除してから再挿入（全量同期）。
   */
  const syncTasksFromNotion = useCallback(async () => {
    const response = await fetch("/api/notion/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: notionSettings.api_key,
        pageId: notionSettings.page_id,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Notion 同期に失敗しました");
    }

    const { tasks: notionTasks } = await response.json();

    // Notion から取得したタスクをローカル Task 型に変換
    const newTasks: Task[] = notionTasks.map(
      (t: { block_id: string; title: string; is_checked: boolean }, i: number) => ({
        id: uuid(),
        block_id: t.block_id,
        title: t.title,
        is_done: t.is_checked,
        position: i,
      })
    );

    await db.clearTasks();
    await db.upsertTasks(newTasks);
    setTasks(newTasks);
  }, [notionSettings]);

  /**
   * タスクを完了状態にする。
   * ローカル DB を更新した後、Notion 側の to_do ブロックもチェックする。
   * 完了後にご褒美ロジックを評価する。
   */
  const completeTask = useCallback(
    async (taskId: string, blockId: string) => {
      // 楽観的 UI 更新
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_done: true } : t))
      );
      await db.updateTaskDone(taskId, true);

      // Notion 側も更新（エラーは握りつぶさずコンソールに出す）
      try {
        await fetch(`/api/notion/tasks/${blockId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: notionSettings.api_key,
            checked: true,
          }),
        });
      } catch (e) {
        console.error("Notion 更新失敗:", e);
      }

      // ご褒美ロジック評価
      const newDoneCount = progress.done_count + 1;
      if (newDoneCount >= progress.target_count) {
        // ご褒美発動
        const chosen = pickReward(rewards);
        setPendingReward(chosen);

        // 次の target_count を再抽選してリセット
        const nextTarget = pickTargetCount(patterns);
        const newProgress: Progress = {
          done_count: 0,
          target_count: nextTarget,
        };
        setProgress(newProgress);
        await db.updateProgress(newProgress);
      } else {
        const newProgress: Progress = {
          ...progress,
          done_count: newDoneCount,
        };
        setProgress(newProgress);
        await db.updateProgress(newProgress);
      }
    },
    [progress, rewards, patterns, notionSettings]
  );

  /**
   * タスクの表示順を更新する。
   * orderedIds はドラッグ後の ID 配列（先頭が position=0）。
   */
  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    setTasks((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      return orderedIds
        .map((id, i) => {
          const t = map.get(id);
          if (!t) return null;
          return { ...t, position: i };
        })
        .filter((t): t is Task => t !== null);
    });

    const positions = orderedIds.map((id, i) => ({ id, position: i }));
    await db.updateTaskPositions(positions);
  }, []);

  // -----------------------------------------------
  // ご褒美操作
  // -----------------------------------------------

  const addReward = useCallback(async (input: RewardInput) => {
    const id = uuid();
    await db.insertReward(id, input);
    setRewards((prev) => [...prev, { id, ...input }]);
  }, []);

  const removeReward = useCallback(async (id: string) => {
    await db.deleteReward(id);
    setRewards((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // -----------------------------------------------
  // パターン操作
  // -----------------------------------------------

  const addPattern = useCallback(async (input: RewardPatternInput) => {
    const id = uuid();
    await db.insertRewardPattern(id, input);
    setPatterns((prev) => [...prev, { id, ...input }]);
  }, []);

  const removePattern = useCallback(async (id: string) => {
    await db.deleteRewardPattern(id);
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // -----------------------------------------------
  // Notion 設定
  // -----------------------------------------------

  const saveNotionSettings = useCallback(async (settings: NotionSettings) => {
    await db.updateNotionSettings(settings);
    setNotionSettings(settings);
  }, []);

  // -----------------------------------------------
  // ご褒美モーダル
  // -----------------------------------------------

  const dismissReward = useCallback(() => {
    setPendingReward(null);
  }, []);

  // -----------------------------------------------
  // Value
  // -----------------------------------------------

  return (
    <AppContext.Provider
      value={{
        tasks,
        rewards,
        patterns,
        progress,
        notionSettings,
        isDbReady,
        pendingReward,
        syncTasksFromNotion,
        completeTask,
        reorderTasks,
        addReward,
        removeReward,
        addPattern,
        removePattern,
        saveNotionSettings,
        dismissReward,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// -----------------------------------------------
// フック
// -----------------------------------------------

/** AppContext の値を取得する。Provider 外で呼ぶと例外を投げる */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext は AppProvider の内側で使用してください");
  }
  return ctx;
}
