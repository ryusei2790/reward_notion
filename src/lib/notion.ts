/**
 * Notion API へのアクセスをまとめたモジュール。
 * ブラウザから直接 Notion API を呼ぶと CORS エラーになるため、
 * 必ず Next.js API Route（/api/notion/...）経由で呼び出す。
 *
 * このファイルは API Route 側（Node.js 環境）で使用する。
 * @notionhq/client を直接使用する。
 */

import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

// -----------------------------------------------
// クライアント生成
// -----------------------------------------------

/**
 * ユーザーが設定した API キーで Notion クライアントを生成する。
 * シングルトンにせず、呼び出しごとに生成する（API キーが変わりうるため）。
 */
export function createNotionClient(apiKey: string): Client {
  return new Client({ auth: apiKey });
}

// -----------------------------------------------
// タスク取得
// -----------------------------------------------

/** Notion の todo ブロック（未完了）を表す最小型 */
export interface NotionTodoBlock {
  /** Notion ブロック ID */
  block_id: string;
  /** todo のテキスト内容 */
  title: string;
  /** チェック済みかどうか */
  is_checked: boolean;
}

/**
 * 指定したページ内のすべての to_do ブロックを取得する。
 * ページネーション（has_more）に対応し、全件取得する。
 *
 * @param apiKey Notion Integration Token
 * @param pageId 同期対象の Notion ページ ID
 */
export async function fetchNotionTodos(
  apiKey: string,
  pageId: string
): Promise<NotionTodoBlock[]> {
  const notion = createNotionClient(apiKey);
  const todos: NotionTodoBlock[] = [];
  let cursor: string | undefined = undefined;

  // ページネーションループ：has_more が false になるまで繰り返す
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      // PartialBlockObjectResponse は type を持たないためスキップ
      if (!isFullBlock(block)) continue;
      if (block.type !== "to_do") continue;

      const todo = block.to_do;
      // リッチテキストを plain_text で結合してタスク名とする
      const title = todo.rich_text.map((t) => t.plain_text).join("");
      todos.push({
        block_id: block.id,
        title,
        is_checked: todo.checked,
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return todos;
}

// -----------------------------------------------
// チェック状態の更新
// -----------------------------------------------

/**
 * 指定した to_do ブロックのチェック状態を更新する。
 *
 * @param apiKey Notion Integration Token
 * @param blockId 対象の Notion ブロック ID
 * @param checked 新しいチェック状態
 */
export async function updateNotionTodoChecked(
  apiKey: string,
  blockId: string,
  checked: boolean
): Promise<void> {
  const notion = createNotionClient(apiKey);
  await notion.blocks.update({
    block_id: blockId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    to_do: { checked } as any,
  });
}

// -----------------------------------------------
// 型ガード
// -----------------------------------------------

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse
): block is BlockObjectResponse {
  return "type" in block;
}
