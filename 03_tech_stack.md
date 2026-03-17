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
| localStorage API | ゲストモードのデータ永続化 | ブラウザ標準API。ライブラリ不要 
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
  ├─── ゲストモード
  │       └── localStorage（タスク・ご褒美・パターン・進捗）
  │
  └─── ログインモード
          ▼
      Next.js (Vercel)
        ├── App Router
        ├── Client Components（インタラクション・dnd-kit）
        ├── AppContext（認証・データ統合管理）
        └── Firebase SDK（クライアントサイド）
                │
                ▼
             Firebase
               ├── Authentication（Google）
               └── Firestore（Security Rules有効）
```

---

## ディレクトリ構成

```
rewardo/
├── src/
│   ├── app/
│   │   ├── login/page.tsx              # ログインページ
│   │   ├── home/page.tsx               # ホーム（タスク一覧）
│   │   ├── reward-settings/page.tsx    # ご褒美設定
│   │   ├── layout.tsx                  # ルートレイアウト
│   │   └── page.tsx                    # ルートリダイレクト
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx              # ヘッダー（認証状態表示）
│   │   ├── task/
│   │   │   ├── TaskList.tsx            # dnd-kit sortable list
│   │   │   ├── TaskItem.tsx
│   │   │   └── AddTaskForm.tsx
│   │   └── reward/
│   │       ├── RewardModal.tsx         # confetti モーダル
│   │       ├── RewardList.tsx
│   │       ├── RewardForm.tsx
│   │       ├── PatternList.tsx
│   │       └── PatternForm.tsx
│   ├── contexts/
│   │   └── AppContext.tsx              # 認証・モード・データ統合管理
│   ├── hooks/
│   │   ├── useTasks.ts                 # タスク操作ロジック
│   │   ├── useRewards.ts              # ご褒美・パターン操作ロジック
│   │   └── useProgress.ts             # 進捗管理ロジック
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts              # Firebaseアプリ初期化
│   │   │   └── auth.ts               # 認証ヘルパー
│   │   ├── firestore.ts              # Firestoreアクセサ（ログインモード）
│   │   ├── localStorage.ts           # ゲストモード用localStorageアクセサ
│   │   └── reward.ts                 # 抽選ロジック（純粋関数・モード共通）
│   └── types/
│       └── index.ts                  # 型定義
├── docs/                             # ドキュメント
└── firestore.rules                   # Firestoreセキュリティルール
```

---

## 環境変数

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
