# 実装ロードマップ

## 開発フェーズ

### Phase 1：プロジェクト初期化

- [ ] `create-next-app` でプロジェクト作成（TypeScript・Tailwind・App Router）
- [ ] 必要パッケージのインストール（dnd-kit / canvas-confetti / shadcn/ui）
- [ ] `.env.local` の設定（Notion API Key・Page ID）
- [ ] Vercel プロジェクト作成・GitHub連携

### Phase 2：Notion連携基盤

- [ ] Notion Integration 作成・API Token取得
- [ ] `lib/notion.ts` 実装：Notion API クライアント初期化
- [ ] `GET /api/notion/tasks`：指定ページ内の未チェック todo ブロックを取得
- [ ] `PATCH /api/notion/tasks/[blockId]`：todo ブロックのチェック状態を更新

### Phase 3：ローカルストレージ基盤

- [ ] `lib/storage.ts` 実装：タスク・ご褒美・パターン・進捗のCRUD
- [ ] Notion から取得したタスクをローカルストレージにキャッシュする設計を決定
- [ ] `ご褒美設定ページ` の設定データ（rewards / reward_patterns / progress）はローカルストレージに保存

### Phase 4：ホーム画面 - タスク同期・表示

- [ ] `/` ページ作成
- [ ] 「Notion同期」ボタン：Notion API からタスクを取得し、ローカルストレージに保存
- [ ] `TaskList.tsx`：タスク一覧の表示
- [ ] `TaskItem.tsx`：タスク名・チェックボックス表示
- [ ] チェックで完了：ローカルの `is_done` 更新 → Notion API で対応 block_id のチェックを更新
- [ ] 完了済みタスクを下部に薄表示

### Phase 5：ドラッグ並び替え

- [ ] `@dnd-kit/core` + `@dnd-kit/sortable` 導入
- [ ] `TaskList.tsx` に SortableContext 実装
- [ ] ドラッグ完了時に `position` をローカルストレージに保存

### Phase 6：ご褒美設定ページ

- [ ] `/reward-settings` ページ作成
- [ ] Notion 連携設定（API Key・Page ID の入力・ローカルストレージ保存）
- [ ] `RewardList.tsx`：ご褒美の登録（内容 + 重み）・一覧・削除
- [ ] `RewardPatternList.tsx`：パターンの登録（min / max）・一覧・削除

### Phase 7：ご褒美発動ロジック

- [ ] `lib/reward.ts` の実装
  - `pickTargetCount(patterns)` - パターンからターゲット数を抽選
  - `pickReward(rewards)` - 重み付き抽選でご褒美を1つ選ぶ
- [ ] タスク完了時に `done_count` を +1
- [ ] `done_count === target_count` でご褒美発動
- [ ] 発動後に `done_count` リセット・次の `target_count` を再抽選
- [ ] `RewardModal.tsx`：canvas-confetti + ご褒美内容表示

### Phase 8：デプロイ

- [ ] Vercel に環境変数設定（`NOTION_API_KEY` / `NOTION_PAGE_ID`）
- [ ] 本番デプロイ・動作確認

---

## 将来の拡張候補

| 機能 | 優先度 | 説明 |
|------|--------|------|
| 日付リセット | 中 | 翌日になったら完了タスクを自動クリア |
| ご褒美履歴 | 低 | 過去に当たったご褒美の履歴表示 |
| 統計・グラフ | 低 | 完了数の推移グラフ |
| PWA対応 | 低 | スマホのホーム画面に追加できるようにする |
| テーマ切替 | 低 | ライト/ダークモード切替 |
| 複数ページ対応 | 低 | 複数のNotionページを切り替えて利用 |
