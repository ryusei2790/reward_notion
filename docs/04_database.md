# データベース設計

## 概要

認証なし。PGlite（WASM版PostgreSQL）を使用してブラウザ内でデータを管理する。
データは **IndexedDB** に永続化される。サーバーサイドDBは使用しない。

```
PGlite（IndexedDB）
  ├── tasks             テーブル
  ├── rewards           テーブル
  ├── reward_patterns   テーブル
  ├── progress          テーブル
  └── notion_settings   テーブル
```

---

## テーブル一覧

### `tasks` テーブル

Notion から取得・キャッシュしたタスク一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK（ローカル管理用） |
| block_id | string | - | Notion の todo ブロック ID |
| title | string | - | タスク名 |
| is_done | boolean | false | 完了フラグ |
| position | number | - | 表示順（並び替えに使用） |

```sql
CREATE TABLE tasks (
  id       TEXT PRIMARY KEY,
  block_id TEXT NOT NULL,
  title    TEXT NOT NULL,
  is_done  BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL
);
```

---

### `rewards` テーブル

ユーザーが登録したご褒美一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK |
| content | string | - | ご褒美の内容（例：「チョコ食べる」） |
| weight | number | 1 | 出やすさの重み（1〜10） |

```sql
CREATE TABLE rewards (
  id      TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  weight  INTEGER NOT NULL DEFAULT 1
);
```

---

### `reward_patterns` テーブル

ご褒美が出るタスク完了数の「幅」パターン一覧。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| id | string | uuid | PK |
| min_count | number | - | 最小タスク完了数 |
| max_count | number | - | 最大タスク完了数 |

```sql
CREATE TABLE reward_patterns (
  id        TEXT PRIMARY KEY,
  min_count INTEGER NOT NULL,
  max_count INTEGER NOT NULL
);
```

---

### `progress` テーブル

現在の完了カウントと目標数（常に1行のみ）。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| done_count | number | 0 | 現在の完了カウント |
| target_count | number | 5 | 次のご褒美までの目標数 |

```sql
CREATE TABLE progress (
  id           INTEGER PRIMARY KEY DEFAULT 1,
  done_count   INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL DEFAULT 5
);
-- 常に id=1 の1行のみ使用する
```

---

### `notion_settings` テーブル

ユーザーが入力した Notion 連携情報。他のテーブルと同様 PGlite で管理する（常に1行のみ）。

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| api_key | string | "" | Notion Integration Token |
| page_id | string | "" | Notion ページ ID |

```sql
CREATE TABLE notion_settings (
  id       INTEGER PRIMARY KEY DEFAULT 1,
  api_key  TEXT NOT NULL DEFAULT '',
  page_id  TEXT NOT NULL DEFAULT ''
);
-- 常に id=1 の1行のみ使用する
```

---

## データ構造図

```
PGlite（IndexedDB）
├── tasks           { id, block_id, title, is_done, position }
├── rewards         { id, content, weight }
├── reward_patterns { id, min_count, max_count }
├── progress        { id=1, done_count, target_count }
└── notion_settings { id=1, api_key, page_id }
```
