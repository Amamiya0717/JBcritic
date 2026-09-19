import Header from "@/components/Header";
import GameListClient from "@/components/GameListClient";
import { createClient } from "@/lib/supabase/server";
import { fetchGamesByCategory } from "@/lib/games";
import { categoryLabel, type GameCategory } from "@/lib/types";

export default async function CategoryListPage({
  category,
}: {
  category: GameCategory;
}) {
  const supabase = await createClient();
  const list = await fetchGamesByCategory(supabase, category);
  const label = categoryLabel(category);

  return (
    <>
      <Header />
      <div className="page">
        <div className="spotlight-header">
          <h2 className="spotlight-title">{label}</h2>
        </div>
      </div>
      <GameListClient
        games={list}
        addHref={`/games/new?category=${category}`}
        addLabel={`${label} 추가`}
        emptyText={`아직 등록된 ${label} 항목이 없어요.`}
        searchPlaceholder={`${label} 제목이나 장르로 검색`}
      />
    </>
  );
}
