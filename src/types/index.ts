/**
 * アプリ全体で使用する型定義。
 * DB テーブル構造・API レスポンス・UI 状態を一元管理する。
 */

// -----------------------------------------------
// タスク（Notion から取得・キャッシュ）
// -----------------------------------------------

/** PGlite の tasks テーブル 1 行に対応 */
export interface Task {
  /** ローカル管理用 UUID（PK） */
  id: string;
  /** Notion の todo ブロック ID */
  block_id: string;
  /** タスク名 */
  title: string;
  /** 完了フラグ */
  is_done: boolean;
  /** 表示順（dnd-kit でソート後に更新） */
  position: number;
}

// -----------------------------------------------
// ご褒美
// -----------------------------------------------

/** PGlite の rewards テーブル 1 行に対応 */
export interface Reward {
  /** UUID（PK） */
  id: string;
  /** ご褒美の内容テキスト（例: 「チョコ食べる」） */
  content: string;
  /** 出やすさの重み（1〜10）。加重抽選に使用 */
  weight: number;
}

// -----------------------------------------------
// ご褒美パターン
// -----------------------------------------------

/** PGlite の reward_patterns テーブル 1 行に対応 */
export interface RewardPattern {
  /** UUID（PK） */
  id: string;
  /** ご褒美が出るタスク完了数の最小値 */
  min_count: number;
  /** ご褒美が出るタスク完了数の最大値 */
  max_count: number;
}

// -----------------------------------------------
// 進捗（常に 1 行）
// -----------------------------------------------

/** PGlite の progress テーブル（id=1 の固定行） */
export interface Progress {
  /** 現在のタスク完了カウント */
  done_count: number;
  /** 次のご褒美発動までの目標完了数 */
  target_count: number;
}

// -----------------------------------------------
// Notion 設定（常に 1 行）
// -----------------------------------------------

/** PGlite の notion_settings テーブル（id=1 の固定行） */
export interface NotionSettings {
  /** Notion Integration Token */
  api_key: string;
  /** 同期対象の Notion ページ ID */
  page_id: string;
}

// -----------------------------------------------
// フォーム用（id なしの入力値型）
// -----------------------------------------------

export type RewardInput = Omit<Reward, "id">;
export type RewardPatternInput = Omit<RewardPattern, "id">;
