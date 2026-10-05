import Link from "next/link";
import Header from "@/components/Header";
import GameRow from "@/components/GameRow";
import SortSelect from "@/components/SortSelect";
import Pagination from "@/components/Pagination";
import { createClient } from "@/lib/supabase/server";
import { fetchGamesByCategory } from "@/lib/games";
import {
  GAMES_PAGE_SIZE,
  categoryLabel,
  categoryPath,
  isSortKey,
  sortGames,
  type GameCategory,
  type SortKey,
} from "@/lib/types";

export default async function CategoryListPage({
  category,
  searchParams,
}: {
  category: GameCategory;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const all = await fetchGamesByCategory(supabase, category);
  const label = categoryLabel(category);
  const basePath = categoryPath(category);

  const sortRaw = searchParams.sort;
  const sort: SortKey =
    typeof sortRaw === "string" && isSortKey(sortRaw) ? sortRaw : "score-desc";
  const sorted = sortGames(all, sort);

  const totalPages = Math.max(1, Math.ceil(sorted.length / GAMES_PAGE_SIZE));
  const pageRawParam = searchParams.page;
  const pageRaw = parseInt(typeof pageRawParam === "string" ? pageRawParam : "1", 10);
  const page = Number.isFinite(pageRaw) ? Math.min(Math.max(pageRaw, 1), totalPages) : 1;
  const pageItems = sorted.slice((page - 1) * GAMES_PAGE_SIZE, page * GAMES_PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="page">
        <div className="spotlight-header">
          <h2 className="spotlight-title">{label}</h2>
        </div>

        {all.length === 0 ? (
          <div className="empty-state">
            <p>아직 등록된 {label} 항목이 없어요.</p>
            <Link href={`/games/new?category=${category}`} className="btn btn-gold">
              {label} 추가
            </Link>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <SortSelect basePath={basePath} sort={sort} />
            </div>
            {pageItems.map((g) => (
              <GameRow key={g.id} game={g} />
            ))}
            <Pagination
              basePath={basePath}
              sort={sort}
              page={page}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </>
  );
}
