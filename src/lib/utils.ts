/**
 * shadcn/ui が要求するクラス名合成ユーティリティ。
 * clsx でオプション結合 → tailwind-merge で重複クラスを除去する。
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
