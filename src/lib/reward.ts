/**
 * ご褒美抽選ロジック（純粋関数）。
 *
 * 副作用ゼロで設計することでテストしやすく、AppContext から独立させる。
 * 変動比率強化スケジュールの核心部分：
 *   1. パターンから次の target_count を決める（範囲ランダム）
 *   2. ご褒美を重み付き抽選で 1 つ選ぶ
 */

import type { Reward, RewardPattern } from "@/types";

// -----------------------------------------------
// target_count の決定
// -----------------------------------------------

/**
 * 登録されたパターン群からランダムに 1 つを選び、
 * その min_count〜max_count の範囲で整数を返す。
 *
 * パターンが 0 件の場合はデフォルト値（5）を返す。
 *
 * @param patterns reward_patterns テーブルの全行
 * @returns 次のご褒美までのタスク完了目標数
 */
export function pickTargetCount(patterns: RewardPattern[]): number {
  if (patterns.length === 0) return 5;

  // パターンをランダムに 1 つ選ぶ（等確率）
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  // min〜max の整数をランダムに返す
  return (
    Math.floor(Math.random() * (pattern.max_count - pattern.min_count + 1)) +
    pattern.min_count
  );
}

// -----------------------------------------------
// ご褒美の加重抽選
// -----------------------------------------------

/**
 * rewards を weight に応じた加重抽選で 1 件返す。
 *
 * アルゴリズム：
 *   1. 全 weight の合計を求める
 *   2. 0〜合計未満の乱数を生成
 *   3. 先頭から weight を累積し、乱数を超えた時点の報酬を選択
 *
 * ご褒美が 0 件の場合は null を返す。
 *
 * @param rewards rewards テーブルの全行
 * @returns 選ばれたご褒美、またはデータがない場合 null
 */
export function pickReward(rewards: Reward[]): Reward | null {
  if (rewards.length === 0) return null;

  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const reward of rewards) {
    rand -= reward.weight;
    if (rand < 0) return reward;
  }

  // 浮動小数点誤差で到達した場合の安全フォールバック
  return rewards[rewards.length - 1];
}
