/**
 * PGlite（WASM版PostgreSQL）の初期化とスキーマ管理。
 *
 * - ブラウザの IndexedDB に永続化するため `idb://rewardo` を指定する
 * - アプリ起動時に CREATE TABLE IF NOT EXISTS を実行してスキーマを保証する
 * - シングルトンパターンで複数インスタンスの生成を防ぐ
 *
 * Next.js の Server Components / API Route では PGlite は動作しない。
 * 必ず Client Component または `'use client'` 環境で呼び出すこと。
 */

import { PGlite } from "@electric-sql/pglite";
import type {
  Task,
  Reward,
  RewardPattern,
  Progress,
  NotionSettings,
  RewardInput,
  RewardPatternInput,
} from "@/types";

// -----------------------------------------------
// シングルトン
// -----------------------------------------------

let _db: PGlite | null = null;

/**
 * PGlite インスタンスを返す。
 * 初回呼び出し時に IndexedDB へのアタッチとスキーマ作成を行う。
 */
export async function getDb(): Promise<PGlite> {
  if (_db) return _db;

  // IndexedDB に永続化。DB 名は "rewardo"
  _db = new PGlite("idb://rewardo");
  await initSchema(_db);
  return _db;
}

// -----------------------------------------------
// スキーマ初期化
// -----------------------------------------------

/**
 * 各テーブルが存在しない場合に作成する。
 * progress / notion_settings は初期行を UPSERT で挿入する。
 */
async function initSchema(db: PGlite): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id       TEXT PRIMARY KEY,
      block_id TEXT NOT NULL,
      title    TEXT NOT NULL,
      is_done  BOOLEAN NOT NULL DEFAULT FALSE,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id      TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      weight  INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reward_patterns (
      id        TEXT PRIMARY KEY,
      min_count INTEGER NOT NULL,
      max_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      id           INTEGER PRIMARY KEY DEFAULT 1,
      done_count   INTEGER NOT NULL DEFAULT 0,
      target_count INTEGER NOT NULL DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS notion_settings (
      id       INTEGER PRIMARY KEY DEFAULT 1,
      api_key  TEXT NOT NULL DEFAULT '',
      page_id  TEXT NOT NULL DEFAULT ''
    );
  `);

  // progress / notion_settings は常に id=1 の 1 行のみ存在させる
  await db.exec(`
    INSERT INTO progress (id, done_count, target_count)
    VALUES (1, 0, 5)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO notion_settings (id, api_key, page_id)
    VALUES (1, '', '')
    ON CONFLICT (id) DO NOTHING;
  `);
}

// -----------------------------------------------
// tasks CRUD
// -----------------------------------------------

/** タスク一覧を position 昇順で取得 */
export async function getTasks(): Promise<Task[]> {
  const db = await getDb();
  const result = await db.query<Task>(
    "SELECT * FROM tasks ORDER BY position ASC"
  );
  return result.rows;
}

/** タスクを一括 UPSERT（Notion 同期時に使用） */
export async function upsertTasks(tasks: Task[]): Promise<void> {
  const db = await getDb();
  for (const t of tasks) {
    await db.query(
      `INSERT INTO tasks (id, block_id, title, is_done, position)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
         SET block_id = EXCLUDED.block_id,
             title    = EXCLUDED.title,
             position = EXCLUDED.position`,
      [t.id, t.block_id, t.title, t.is_done, t.position]
    );
  }
}

/** タスクの完了状態を更新 */
export async function updateTaskDone(
  id: string,
  is_done: boolean
): Promise<void> {
  const db = await getDb();
  await db.query("UPDATE tasks SET is_done = $1 WHERE id = $2", [is_done, id]);
}

/** タスクの position を一括更新（ドラッグ並び替え後に呼ぶ） */
export async function updateTaskPositions(
  positions: { id: string; position: number }[]
): Promise<void> {
  const db = await getDb();
  for (const { id, position } of positions) {
    await db.query("UPDATE tasks SET position = $1 WHERE id = $2", [
      position,
      id,
    ]);
  }
}

/** すべてのタスクを削除（同期前のリセットに使用） */
export async function clearTasks(): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM tasks");
}

// -----------------------------------------------
// rewards CRUD
// -----------------------------------------------

export async function getRewards(): Promise<Reward[]> {
  const db = await getDb();
  const result = await db.query<Reward>("SELECT * FROM rewards");
  return result.rows;
}

export async function insertReward(
  id: string,
  input: RewardInput
): Promise<void> {
  const db = await getDb();
  await db.query(
    "INSERT INTO rewards (id, content, weight) VALUES ($1, $2, $3)",
    [id, input.content, input.weight]
  );
}

export async function deleteReward(id: string): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM rewards WHERE id = $1", [id]);
}

// -----------------------------------------------
// reward_patterns CRUD
// -----------------------------------------------

export async function getRewardPatterns(): Promise<RewardPattern[]> {
  const db = await getDb();
  const result = await db.query<RewardPattern>("SELECT * FROM reward_patterns");
  return result.rows;
}

export async function insertRewardPattern(
  id: string,
  input: RewardPatternInput
): Promise<void> {
  const db = await getDb();
  await db.query(
    "INSERT INTO reward_patterns (id, min_count, max_count) VALUES ($1, $2, $3)",
    [id, input.min_count, input.max_count]
  );
}

export async function deleteRewardPattern(id: string): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM reward_patterns WHERE id = $1", [id]);
}

// -----------------------------------------------
// progress
// -----------------------------------------------

export async function getProgress(): Promise<Progress> {
  const db = await getDb();
  const result = await db.query<Progress & { id: number }>(
    "SELECT * FROM progress WHERE id = 1"
  );
  const row = result.rows[0];
  return { done_count: row.done_count, target_count: row.target_count };
}

export async function updateProgress(progress: Progress): Promise<void> {
  const db = await getDb();
  await db.query(
    "UPDATE progress SET done_count = $1, target_count = $2 WHERE id = 1",
    [progress.done_count, progress.target_count]
  );
}

// -----------------------------------------------
// notion_settings
// -----------------------------------------------

export async function getNotionSettings(): Promise<NotionSettings> {
  const db = await getDb();
  const result = await db.query<NotionSettings & { id: number }>(
    "SELECT * FROM notion_settings WHERE id = 1"
  );
  const row = result.rows[0];
  return { api_key: row.api_key, page_id: row.page_id };
}

export async function updateNotionSettings(
  settings: NotionSettings
): Promise<void> {
  const db = await getDb();
  await db.query(
    "UPDATE notion_settings SET api_key = $1, page_id = $2 WHERE id = 1",
    [settings.api_key, settings.page_id]
  );
}
