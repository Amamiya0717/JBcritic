import Link from "next/link";
import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import { createClient } from "@/lib/supabase/server";
import { withStats, type Game } from "@/lib/types";

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const qRaw = searchParams.q;
  const q = (typeof qRaw === "string" ? qRaw : "").trim();

  if (!q) {
    return (
      <>
        <Header />
        <div className="page">
          <div className="empty-state">
            <p>검색어를 입력해주세요.</p>
            <Link href="/" className="btn btn-gold">
              홈으로
            </Link>
          </div>
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("*, reviews(score)")
    .order("created_at", { ascending: false });

  const rows = (games ?? []) as (Game & { reviews: { score: number }[] })[];
  const needle = q.toLowerCase();
  const list = rows
    .filter(
      (g) =>
        g.title.toLowerCase().includes(needle) ||
        (g.genre || "").toLowerCase().includes(needle)
    )
    .map((g) => {
      const { reviews, ...game } = g;
      return withStats(game, reviews);
    });

  return (
    <>
      <Header />
      <div className="page">
        <div className="spotlight-header">
          <h2 className="spotlight-title">&ldquo;{q}&rdquo; 검색 결과 ({list.length})</h2>
        </div>
        {list.length === 0 && (
          <div className="empty-state">
            <p>검색 결과가 없어요.</p>
            <Link href="/" className="btn btn-gold">
              홈으로
            </Link>
          </div>
        )}
      </div>
      {list.length > 0 && <GameListClient games={list} initialSearch={q} />}
    </>
  );
}
