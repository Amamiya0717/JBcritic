import Link from "next/link";
import Header from "@/components/Header";
import MyPageTabs from "@/components/MyPageTabs";
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Header />
        <div className="page">
          <div className="empty-state">
            <p>마이페이지는 로그인 후 이용할 수 있어요.</p>
            <Link href="/login" className="btn btn-gold">
              로그인
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page">
        <MyPageTabs active="reviews" />

        <h4 className="section-title" style={{ fontSize: "0.78rem" }}>
          내가 쓴 평가
        </h4>
        <div className="empty-state">
          <p>준비 중이에요.</p>
        </div>

        <h4
          className="section-title"
          style={{ fontSize: "0.78rem", marginTop: 24 }}
        >
          내가 쓴 게시판 글
        </h4>
        <div className="empty-state">
          <p>준비 중이에요.</p>
        </div>
      </div>
    </>
  );
}
