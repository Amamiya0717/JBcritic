import Link from "next/link";
import Header from "@/components/Header";
import NicknameForm from "@/components/NicknameForm";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, created_at")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header />
      <div className="page">
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          마이페이지
        </h2>

        {profile && (
          <p className="meta-text" style={{ marginBottom: 16 }}>
            {fmtDate(profile.created_at)} 가입
          </p>
        )}

        <NicknameForm initialNickname={profile?.nickname ?? ""} />

        <h3 className="section-title" style={{ marginTop: 24 }}>
          내가 쓴 평가
        </h3>
        <div className="empty-state">
          <p>준비 중이에요.</p>
        </div>

        <h3 className="section-title" style={{ marginTop: 24 }}>
          내가 쓴 게시판 글
        </h3>
        <div className="empty-state">
          <p>준비 중이에요.</p>
        </div>
      </div>
    </>
  );
}
