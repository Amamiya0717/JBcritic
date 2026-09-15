import type { Metadata } from "next";
import "./globals.css";
import InAppBrowserBanner from "@/components/InAppBrowserBanner";

export const metadata: Metadata = {
  title: "JBcritic",
  description: "정신병동이 플레이한 게임에 정신병동이 직접 매긴 점수",
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <InAppBrowserBanner />
        {props.children}
      </body>
    </html>
  );
}
