"use client";

/**
 * TaskList — dnd-kit SortableContext を使ったタスク一覧。
 *
 * 未完了タスクを上部に、完了済みタスクを下部（薄表示）に分けて表示する。
 * ドラッグ完了時に reorderTasks を呼んで DB に position を保存する。
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAppContext } from "@/contexts/AppContext";
import { TaskItem } from "./TaskItem";

export function TaskList() {
  const { tasks, reorderTasks, isDbReady } = useAppContext();

  // ポインター（マウス・タッチ）とキーボードの両方に対応する
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 未完了と完了済みに分けて表示順でソート
  const activeTasks = tasks
    .filter((t) => !t.is_done)
    .sort((a, b) => a.position - b.position);
  const doneTasks = tasks
    .filter((t) => t.is_done)
    .sort((a, b) => a.position - b.position);

  /** ドラッグ完了時に並び替えを確定する */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // active/over は未完了タスクの中だけで並び替える
    const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
    const newIndex = activeTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activeTasks, oldIndex, newIndex);
    // 完了済みタスクは末尾に連結して全体の position を更新
    const all = [...reordered, ...doneTasks];
    await reorderTasks(all.map((t) => t.id));
  };

  if (!isDbReady) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">読み込み中...</p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        タスクがありません。Notion 同期ボタンで取得してください。
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={activeTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {activeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* 完了済みセクション（並び替え対象外） */}
      {doneTasks.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-zinc-600">完了済み</p>
          {doneTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </DndContext>
  );
}
