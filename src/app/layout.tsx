/**
 * ルートレイアウト。
 * AppProvider で全ページを包み、PGlite のシングルトン状態を共有する。
 * RewardModal はここに配置し、どのページでも発火できるようにする。
 */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/layout/Header";
import { RewardModal } from "@/components/reward/RewardModal";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rewardo",
  description: "ご褒美ガチャでタスクを続けるモチベーション管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${geist.variable} bg-zinc-950 font-sans text-zinc-100 antialiased`}>
        <AppProvider>
          <Header />
          <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
          <RewardModal />
        </AppProvider>
      </body>
    </html>
  );
}
