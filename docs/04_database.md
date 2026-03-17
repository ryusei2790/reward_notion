# データベース設計

## 概要

認証なし・ローカルストレージのみを使用。
ブラウザの `localStorage` にすべてのデータを保存する。サーバーサイドDBは使用しない。

```
localStorage
  ├── "tasks"           → Task[]
  ├── "rewards"         → Reward[]
  ├── "reward_patterns" → RewardPattern[]
  ├── "progress"        → Progress
  └── "notion_settings" → NotionSettings
```

---

## データ構造一覧

### `tasks`（キー: `"tasks"`）

Notion から取得・キャッシュしたタスク一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK（ローカル管理用） |
| block_id | string | - | Notion の todo ブロック ID |
| title | string | - | タスク名 |
| is_done | boolean | false | 完了フラグ |
| position | number | - | 表示順（並び替えに使用） |

```json
// localStorage["tasks"]
[
  {
    "id": "local-uuid-xxx",
    "block_id": "notion-block-id-xxx",
    "title": "英単語を10個覚える",
    "is_done": false,
    "position": 0
  }
]
```

---

### `rewards`（キー: `"rewards"`）

ユーザーが登録したご褒美一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK |
| content | string | - | ご褒美の内容（例：「チョコ食べる」） |
| weight | number | 1 | 出やすさの重み（1〜10） |

```json
// localStorage["rewards"]
[
  {
    "id": "uuid-yyy",
    "content": "チョコ食べる",
    "weight": 3
  }
]
```

---

### `reward_patterns`（キー: `"reward_patterns"`）

ご褒美が出るタスク完了数の「幅」パターン一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK |
| min_count | number | - | 最小タスク完了数 |
| max_count | number | - | 最大タスク完了数 |

```json
// localStorage["reward_patterns"]
[
  {
    "id": "uuid-zzz",
    "min_count": 3,
    "max_count": 5
  }
]
```

---

### `progress`（キー: `"progress"`）

現在の完了カウントと目標数（単一オブジェクト）。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| done_count | number | 0 | 現在の完了カウント |
| target_count | number | 5 | 次のご褒美までの目標数 |

```json
// localStorage["progress"]
{
  "done_count": 2,
  "target_count": 4
}
```

---

### `notion_settings`（キー: `"notion_settings"`）

ユーザーが入力した Notion 連携情報。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page_id | string | "" | Notion ページ ID |

```json
// localStorage["notion_settings"]
{
  "page_id": "notion-page-id-xxx"
}
```

> `NOTION_API_KEY` は `.env.local` で管理し、Next.js の API Route 経由でのみ使用する。

---

## データ構造図

```
localStorage
├── "tasks"
│   └── Task[]  { id, block_id, title, is_done, position }
├── "rewards"
│   └── Reward[]  { id, content, weight }
├── "reward_patterns"
│   └── RewardPattern[]  { id, min_count, max_count }
├── "progress"
│   └── Progress  { done_count, target_count }
└── "notion_settings"
    └── NotionSettings  { page_id }
```
