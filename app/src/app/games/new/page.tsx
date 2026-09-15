import Link from "next/link";
import Header from "@/components/Header";
import AddGameForm from "@/components/AddGameForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewGamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <div className="page">
        <Link href="/" className="back-link btn-text">
          ← 목록으로
        </Link>
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          새 게임 등록
        </h2>
        {user ? (
          <AddGameForm />
        ) : (
          <div className="empty-state">
            <p>게임을 등록하려면 로그인해주세요.</p>
            <Link href="/login" className="btn btn-gold">
              로그인
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
