# 技術スタック

## 選定方針

- モダンなReactエコシステムで実装経験を積む
- next.jsでルーティングを制御、PGlite（WASM版PostgreSQL）でブラウザ内データベース（IndexedDB に永続化）
- 型安全なTypeScriptで保守性を確保

---

## スタック一覧

### フロントエンド

| 技術 | バージョン | 選定理由 |
|------|-----------|----------|
| Next.js | 14（App Router） | SSR・ルーティング・最適化が標準装備。App Routerで最新のReact Server Componentsを活用 |
| React | 18 | Next.jsに内包 |
| TypeScript | 5.x | 型安全性・補完による開発効率向上 |
| Tailwind CSS | 3.x | ユーティリティファーストで素早くUIを構築 |

### ライブラリ

| ライブラリ | 用途 | 選定理由 |
|-----------|------|----------|
| @dnd-kit/core | ドラッグ&ドロップ | アクセシビリティ対応・Reactフレンドリーな設計 |
| @dnd-kit/sortable | リスト並び替え | dnd-kitのソータブル拡張 |
| canvas-confetti | ご褒美アニメーション | 軽量で導入が容易。ブラウザネイティブなアニメーション |
| @electric-sql/pglite | ブラウザ内データベース（IndexedDB への永続化） | WASM版PostgreSQL。SQLでデータ操作が可能。ライブラリ不要なlocalStorageと違いスキーマ管理・型安全なクエリが書ける
| shadcn/ui| UI、データテーブル、見た目全般 |　コンポーネントとしてすでに揃っていてハードコードでデザインをする必要がないから

### インフラ / デプロイ

| 技術 | 用途 |
|------|------|
| Vercel | Next.jsの最適なホスティング先。GitHubと連携した自動デプロイ |

---

## アーキテクチャ概要

```
Browser
  │
  └── Next.js (Vercel)
        ├── App Router
        ├── Client Components（インタラクション・dnd-kit）
        ├── AppContext（データ統合管理）
        ├── PGlite（IndexedDB）（ご褒美・パターン・進捗・タスクキャッシュ）
        └── Notion API（タスク取得・完了同期）
                │
                ▼
            Notion
              └── 指定ページ内のTodoブロック
```

---

## ディレクトリ構成

```
rewardo/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # ホーム（タスク一覧）
│   │   ├── reward-settings/page.tsx    # ご褒美設定・Notion連携情報入力
│   │   └── layout.tsx                  # ルートレイアウト
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx              # ヘッダー
│   │   ├── task/
│   │   │   ├── TaskList.tsx            # dnd-kit sortable list
│   │   │   ├── TaskItem.tsx
│   │   │   └── SyncButton.tsx          # Notion手動同期ボタン
│   │   └── reward/
│   │       ├── RewardModal.tsx         # confetti モーダル
│   │       ├── RewardList.tsx
│   │       ├── RewardForm.tsx
│   │       ├── PatternList.tsx
│   │       └── PatternForm.tsx
│   ├── contexts/
│   │   └── AppContext.tsx              # データ統合管理
│   ├── hooks/
│   │   ├── useTasks.ts                 # タスク操作ロジック（Notion同期含む）
│   │   ├── useRewards.ts              # ご褒美・パターン操作ロジック
│   │   └── useProgress.ts             # 進捗管理ロジック
│   ├── lib/
│   │   ├── notion.ts                  # Notion APIアクセサ（タスク取得・完了同期）
│   │   ├── localStorage.ts            # localStorageアクセサ（ご褒美・パターン・進捗）
│   │   └── reward.ts                  # 抽選ロジック（純粋関数）
│   └── types/
│       └── index.ts                   # 型定義
└── docs/                              # ドキュメント
```

---

## 環境変数

```env
NOTION_API_KEY=your_notion_integration_token
```

> `NOTION_API_KEY` および `NOTION_PAGE_ID` はどちらもユーザーがアプリ内のご褒美設定ページから入力して localStorage に保存する（環境変数ではなくユーザー設定値として管理）。Next.js の API Route はリクエストボディ経由でこれらの値を受け取って Notion API を呼び出す。`.env.local` は開発時の動作確認用途に限定して使用する。
