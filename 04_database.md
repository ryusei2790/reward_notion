# データベース設計

## 概要

Firebase Firestore（NoSQL）を使用。
ユーザーごとのサブコレクション構造で データを分離し、Security Rules でアクセス制御を行う。

```
users/{uid}/
  ├── notionapi 
  |-- notion page_id
  |--notion todo id
  ├── rewards/{rewardId}
  ├── reward_patterns/{patternId}
  └── progress/current
```

---

## コレクション一覧

### `users/{uid}/tasks/{taskId}`

ユーザーのタスクを管理する。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | auto（ドキュメントID） | PK |
| title | string | - | タスク名 |
| is_done | boolean | false | 完了フラグ |
| position | number | - | 表示順（並び替えに使用） |
| created_at | timestamp | serverTimestamp() | 作成日時 |

```json
// users/{uid}/tasks/{taskId}
{
  "title": "英単語を10個覚える",
  "is_done": false,
  "position": 0,
  "created_at": "<Timestamp>",
  "block_id": "notionのブロックid"
}
```

---

### `users/{uid}/rewards/{rewardId}`

ユーザーが登録したご褒美を管理する。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | auto（ドキュメントID） | PK |
| content | string | - | ご褒美の内容（例：「チョコ食べる」） |
| weight | number | 1 | 出やすさの重み（1〜10） |
| created_at | timestamp | serverTimestamp() | 作成日時 |

```json
// users/{uid}/rewards/{rewardId}
{
  "content": "チョコ食べる",
  "weight": 3,
  "created_at": "<Timestamp>"
}
```

---

### `users/{uid}/reward_patterns/{patternId}`

ご褒美が出るタスク完了数の「幅」をパターンとして管理する。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | auto（ドキュメントID） | PK |
| min_count | number | - | 最小タスク完了数 |
| max_count | number | - | 最大タスク完了数 |
| created_at | timestamp | serverTimestamp() | 作成日時 |

```json
// users/{uid}/reward_patterns/{patternId}
{
  "min_count": 3,
  "max_count": 5,
  "created_at": "<Timestamp>"
}
```

---

### `users/{uid}/progress/current`

ユーザーごとの現在の完了カウントと目標数を管理する（固定ドキュメント）。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| done_count | number | 0 | 現在の完了カウント |
| target_count | number | 5 | 次のご褒美までの目標数 |

```json
// users/{uid}/progress/current
{
  "done_count": 2,
  "target_count": 4
}
```

---

## コレクション階層図

```
Firestore
└── users/
    └── {uid}/
        ├── tasks/
        │   └── {taskId}  { title, is_done, position, created_at }
        ├── rewards/
        │   └── {rewardId}  { content, weight, created_at }
        ├── reward_patterns/
        │   └── {patternId}  { min_count, max_count, created_at }
        └── progress/
            └── current  { done_count, target_count }
```
