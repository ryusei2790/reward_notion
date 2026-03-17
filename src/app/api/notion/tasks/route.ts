/**
 * POST /api/notion/tasks
 *
 * リクエストボディ: { apiKey: string; pageId: string }
 * レスポンス:       { tasks: NotionTodoBlock[] }
 *
 * ブラウザから直接 Notion API を叩くと CORS エラーになるため、
 * このサーバーサイド Route がプロキシとして機能する。
 * API キーはボディ経由で受け取り、環境変数には保存しない。
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchNotionTodos } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, pageId } = body as { apiKey: string; pageId: string };

    if (!apiKey || !pageId) {
      return NextResponse.json(
        { error: "apiKey と pageId は必須です" },
        { status: 400 }
      );
    }

    const tasks = await fetchNotionTodos(apiKey, pageId);
    return NextResponse.json({ tasks });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
