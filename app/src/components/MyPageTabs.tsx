import Link from "next/link";

export default function MyPageTabs({ active }: { active: "reviews" | "account" }) {
  return (
    <div className="subtabs">
      <Link
        href="/mypage"
        className={`subtab${active === "reviews" ? " active" : ""}`}
      >
        내 리뷰·작성 글
      </Link>
      <Link
        href="/mypage/account"
        className={`subtab${active === "account" ? " active" : ""}`}
      >
        내 계정
      </Link>
    </div>
  );
}
