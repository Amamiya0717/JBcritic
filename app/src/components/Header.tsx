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
          <div className="topbar-row1">
            <Link href="/" className="logo">
              <Logo />
              <div className="logo-text">JBcritic</div>
            </Link>

            <div className="nav-actions">
              {user ? (
                <>
                  <Link href="/games/new" className="nav-btn primary">
                    게임 추가
                  </Link>
                  <div className="profile-menu-wrap">
                    <button
                      type="button"
                      className="profile-icon-btn"
                      aria-label="마이페이지 메뉴"
                    >
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <defs>
                          <clipPath id="avatarClip">
                            <circle cx="20" cy="20" r="18" />
                          </clipPath>
                        </defs>
                        <circle cx="20" cy="20" r="18" fill="#ffffff" />
                        <g clipPath="url(#avatarClip)">
                          <circle cx="20" cy="16" r="6.5" fill="#0d0d0d" />
                          <ellipse cx="20" cy="34" rx="13" ry="11" fill="#0d0d0d" />
                        </g>
                      </svg>
                    </button>
                    <div className="profile-menu">
                      <Link href="/mypage" className="profile-menu-item">
                        내 리뷰·작성 글
                      </Link>
                      <Link href="/mypage/account" className="profile-menu-item">
                        내 계정
                      </Link>
                      <form action={signOut}>
                        <button type="submit" className="profile-menu-item">
                          로그아웃
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className="nav-btn primary">
                  Register
                </Link>
              )}
            </div>
          </div>

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
              width="17"
              height="17"
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
        </div>
      </div>
    </>
  );
}
