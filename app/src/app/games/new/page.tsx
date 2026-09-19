import Link from "next/link";
import Header from "@/components/Header";
import AddGameForm from "@/components/AddGameForm";
import { createClient } from "@/lib/supabase/server";
import { categoryPath, isGameCategory, type GameCategory } from "@/lib/types";

export default async function NewGamePage(props: PageProps<"/games/new">) {
  const searchParams = await props.searchParams;
  const categoryRaw = searchParams.category;
  const category: GameCategory =
    typeof categoryRaw === "string" && isGameCategory(categoryRaw)
      ? categoryRaw
      : "game";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <div className="page">
        <Link href={categoryPath(category)} className="back-link btn-text">
          ← 목록으로
        </Link>
        <h2 className="section-title" style={{ fontSize: "1rem" }}>
          새 항목 등록
        </h2>
        {user ? (
          <AddGameForm defaultCategory={category} />
        ) : (
          <div className="empty-state">
            <p>등록하려면 로그인해주세요.</p>
            <Link href="/login" className="btn btn-gold">
              로그인
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
