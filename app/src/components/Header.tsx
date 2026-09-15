import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";
import Logo from "@/components/Logo";

const CATEGORIES = [
  { label: "Games", href: "/" },
  { label: "Anime", href: null },
  { label: "Movies", href: null },
  { label: "Music", href: null },
  { label: "Lives", href: null },
  { label: "News", href: null },
] as const;

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="logo">
            <Logo />
            <div className="logo-text">JBcritic</div>
          </Link>

          <nav className="main-nav">
            {CATEGORIES.map((c) =>
              c.href ? (
                <Link key={c.label} href={c.href} className="main-nav-link">
                  {c.label}
                </Link>
              ) : (
                <span key={c.label} className="main-nav-link disabled">
                  {c.label}
                </span>
              )
            )}
          </nav>

          <form action="/" method="GET" className="nav-search">
            <svg
              className="nav-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="nav-search-input"
              type="text"
              name="q"
              placeholder="검색"
              aria-label="게임 검색"
            />
          </form>

          <div className="nav-actions">
            {user ? (
              <>
                <Link href="/games/new" className="nav-btn primary">
                  게임 추가
                </Link>
                <Link href="/mypage" className="nav-user">
                  마이페이지
                </Link>
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
