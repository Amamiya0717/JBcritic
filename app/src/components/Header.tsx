import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? null;
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">JB</div>
            <div className="logo-text">JBcritic</div>
          </Link>
          <div className="nav">
            <Link href="/" className="nav-btn">
              전체 게임
            </Link>
            {user ? (
              <>
                <Link href="/games/new" className="nav-btn primary">
                  게임 추가
                </Link>
                <span className="nav-user">{nickname}</span>
                <form action={signOut}>
                  <button type="submit" className="nav-btn">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="nav-btn primary">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="subbar">
        <div className="subbar-inner">
          정신병동이 플레이한 게임에 <span>정신병동이 직접 매긴</span> 점수
        </div>
      </div>
    </>
  );
}
