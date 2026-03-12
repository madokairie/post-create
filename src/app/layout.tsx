import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "投稿作成ツール",
  description: "ローンチコンセプトに基づいた投稿コンテンツ作成ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
