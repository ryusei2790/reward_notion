# 📘 実装概要解説

## 作成したファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/types/index.ts` | 全データ型定義（Task / Reward / RewardPattern / Progress / NotionSettings） |
| `src/lib/utils.ts` | Tailwind クラス合成ユーティリティ（cn関数） |
| `src/lib/db.ts` | PGlite 初期化・スキーマ作成・全テーブルの CRUD 関数 |
| `src/lib/notion.ts` | Notion API アクセサ（サーバーサイド専用） |
| `src/lib/reward.ts` | 抽選ロジック純粋関数（pickTargetCount / pickReward） |
| `src/contexts/AppContext.tsx` | アプリ全体のデータ統合管理 Context |
| `src/app/api/notion/tasks/route.ts` | POST: Notion からタスク取得（CORS 回避プロキシ） |
| `src/app/api/notion/tasks/[blockId]/route.ts` | PATCH: Notion の todo チェック更新 |
| `src/components/layout/Header.tsx` | 共通ヘッダー（ナビ + 進捗バー） |
| `src/components/task/TaskItem.tsx` | タスク 1 件（dnd-kit ソータブル + チェックボックス） |
| `src/components/task/TaskList.tsx` | タスク一覧（dnd-kit DndContext + 完了/未完了分割） |
| `src/components/task/SyncButton.tsx` | Notion 手動同期ボタン |
| `src/components/reward/RewardModal.tsx` | ご褒美発動モーダル（canvas-confetti） |
| `src/components/reward/RewardForm.tsx` | ご褒美登録フォーム |
| `src/components/reward/RewardList.tsx` | ご褒美一覧・削除 |
| `src/components/reward/PatternForm.tsx` | パターン登録フォーム |
| `src/components/reward/PatternList.tsx` | パターン一覧・削除 |
| `src/app/layout.tsx` | ルートレイアウト（AppProvider + Header + RewardModal） |
| `src/app/page.tsx` | ホーム画面（タスク一覧 + Notion 同期ボタン） |
| `src/app/reward-settings/page.tsx` | ご褒美設定ページ（Notion 設定 + ご褒美 + パターン） |

---

## データの流れ

```
ユーザー操作
  │
  ├── Notion 同期ボタン押下
  │     → POST /api/notion/tasks（サーバー）
  │     → Notion API でタスク取得
  │     → PGlite tasks テーブルに保存
  │     → AppContext の tasks state 更新
  │     → TaskList に反映
  │
  ├── タスクチェックボックス ON
  │     → AppContext.completeTask()
  │     → PGlite tasks.is_done = true
  │     → PATCH /api/notion/tasks/[blockId]
  │     → progress.done_count + 1
  │     → done_count === target_count → ご褒美発動
  │           → pickReward() で加重抽選
  │           → pendingReward セット
  │           → RewardModal 表示（confetti）
  │           → done_count リセット + target_count 再抽選
  │
  └── ドラッグ並び替え
        → arrayMove で順序変更
        → PGlite tasks.position を一括更新
```

---

## ご褒美ロジック（変動比率強化スケジュール）

```
1. アプリ起動時：progress.target_count = 5（デフォルト）
2. タスク完了 → done_count + 1
3. done_count >= target_count になったら：
   - pickReward(rewards) で加重抽選 → ご褒美表示
   - pickTargetCount(patterns) で次の目標数を再抽選
   - done_count = 0 にリセット
```

---

## 理解確認チェック

- [ ] PGlite が IndexedDB に永続化する仕組みを説明できる
- [ ] API Route が CORS 回避のプロキシとして機能する理由を説明できる
- [ ] 変動比率強化スケジュールがなぜモチベーションを高めるか説明できる
- [ ] AppContext のシングルトン DB インスタンスがなぜ必要かを説明できる

> ✅ 上記を理解したら「承認」と返信してください。`npm run dev` で動作確認に進みます。
