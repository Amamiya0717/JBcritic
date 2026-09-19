"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GameRow from "@/components/GameRow";
import { SORT_OPTIONS, sortGames, type GameWithStats, type SortKey } from "@/lib/types";

const PAGE_SIZE = 12;

export default function GameListClient({
  games,
  initialSearch = "",
  showSearch = true,
  showCategoryTag = false,
  emptyText = "아직 등록된 게임이 없어요. 정신병동의 첫 평가를 기록해보세요.",
  addHref = "/games/new",
  addLabel = "게임 추가",
  searchPlaceholder = "게임 제목이나 장르로 검색",
}: {
  games: GameWithStats[];
  initialSearch?: string;
  showSearch?: boolean;
  showCategoryTag?: boolean;
  emptyText?: string;
  addHref?: string;
  addLabel?: string;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<SortKey>("score-desc");
  const [showAll, setShowAll] = useState(false);

  const list = useMemo(() => {
    let result = games;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.genre || "").toLowerCase().includes(q)
      );
    }
    return sortGames(result, sort);
  }, [games, search, sort]);

  const visibleList = showAll ? list : list.slice(0, PAGE_SIZE);

  return (
    <div className="page">
      <div className="toolbar">
        {showSearch && (
          <input
            className="input"
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        games.length === 0 ? (
          <div className="empty-state">
            <p>{emptyText}</p>
            <Link href={addHref} className="btn btn-gold">
              {addLabel}
            </Link>
          </div>
        ) : (
          <div className="empty-state">
            <p>검색 결과가 없어요.</p>
          </div>
        )
      ) : (
        <>
          {visibleList.map((g) => (
            <GameRow key={g.id} game={g} showCategoryTag={showCategoryTag} />
          ))}
          {!showAll && list.length > PAGE_SIZE && (
            <div className="load-more">
              <button
                type="button"
                className="btn"
                onClick={() => setShowAll(true)}
              >
                전체보기 ({list.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
