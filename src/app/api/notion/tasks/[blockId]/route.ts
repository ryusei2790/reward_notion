/**
 * PATCH /api/notion/tasks/[blockId]
 *
 * リクエストボディ: { apiKey: string; checked: boolean }
 * レスポンス:       { ok: true }
 *
 * 指定した Notion to_do ブロックのチェック状態を更新する。
 * タスク完了チェック時にクライアントから呼ばれる。
 */

import { NextRequest, NextResponse } from "next/server";
import { updateNotionTodoChecked } from "@/lib/notion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const { blockId } = await params;
    const body = await req.json();
    const { apiKey, checked } = body as { apiKey: string; checked: boolean };

    if (!apiKey) {
      return NextResponse.json({ error: "apiKey は必須です" }, { status: 400 });
    }

    await updateNotionTodoChecked(apiKey, blockId, checked);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
