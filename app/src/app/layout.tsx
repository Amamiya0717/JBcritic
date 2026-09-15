import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정병크리틱",
  description: "정신병동이 플레이한 게임에 정신병동이 직접 매긴 점수",
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{props.children}</body>
    </html>
  );
}
