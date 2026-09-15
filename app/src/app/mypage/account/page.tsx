import Link from "next/link";
import Header from "@/components/Header";
import MyPageTabs from "@/components/MyPageTabs";
import NicknameForm from "@/components/NicknameForm";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";

export default async function MyAccountPage() {
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
        <MyPageTabs active="account" />

        {profile && (
          <p className="meta-text" style={{ marginBottom: 16 }}>
            {fmtDate(profile.created_at)} 가입
          </p>
        )}

        <NicknameForm initialNickname={profile?.nickname ?? ""} />
      </div>
    </>
  );
}
