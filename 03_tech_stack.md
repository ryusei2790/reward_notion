# 技術スタック

## 選定方針

- モダンなReactエコシステムで実装経験を積む
- next.jsでルーディングを制御、PGliteでローカルデータベース
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
| localStorage API | ご褒美・パターン・進捗のデータ永続化 | ブラウザ標準API。ライブラリ不要
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
        ├── localStorage（ご褒美・パターン・進捗）
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
│   │   ├── home/page.tsx               # ホーム（タスク一覧）
│   │   ├── reward-settings/page.tsx    # ご褒美設定・Notion連携情報入力
│   │   ├── layout.tsx                  # ルートレイアウト
│   │   └── page.tsx                    # ルートリダイレクト
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

> `NOTION_PAGE_ID` はユーザーがアプリ内のご褒美設定ページから入力して localStorage に保存する（環境変数ではなくユーザー設定値として管理）。
