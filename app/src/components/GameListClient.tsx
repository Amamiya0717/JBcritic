"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScoreBox from "@/components/ScoreBox";
import GameThumb from "@/components/GameThumb";
import type { GameWithStats } from "@/lib/types";

type SortKey = "score-desc" | "score-asc" | "recent" | "reviews" | "title";

export default function GameListClient({ games }: { games: GameWithStats[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("score-desc");

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
    result = [...result].sort((a, b) => {
      if (sort === "score-desc")
        return (b.avgScore ?? -1) - (a.avgScore ?? -1);
      if (sort === "score-asc") return (a.avgScore ?? 999) - (b.avgScore ?? 999);
      if (sort === "recent")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "reviews") return b.reviewCount - a.reviewCount;
      if (sort === "title") return a.title.localeCompare(b.title, "ko");
      return 0;
    });
    return result;
  }, [games, search, sort]);

  return (
    <div className="page">
      <div className="toolbar">
        <input
          className="input"
          type="text"
          placeholder="게임 제목이나 장르로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="score-desc">점수 높은순</option>
          <option value="score-asc">점수 낮은순</option>
          <option value="recent">최근 등록순</option>
          <option value="reviews">리뷰 많은순</option>
          <option value="title">이름순</option>
        </select>
      </div>

      {list.length === 0 ? (
        games.length === 0 ? (
          <div className="empty-state">
            <p>아직 등록된 게임이 없어요. 정신병동의 첫 평가를 기록해보세요.</p>
            <Link href="/games/new" className="btn btn-gold">
              게임 추가
            </Link>
          </div>
        ) : (
          <div className="empty-state">
            <p>검색 결과가 없어요.</p>
          </div>
        )
      ) : (
        list.map((g) => (
          <Link key={g.id} href={`/games/${g.id}`} className="game-row">
            <GameThumb coverUrl={g.cover_url} color={g.color} title={g.title} />
            <ScoreBox score={g.avgScore} size="md" />
            <div className="game-row-body">
              <p className="game-title">{g.title}</p>
              <div className="game-meta">
                {g.genre && <span className="tag">{g.genre}</span>}
                <span className="meta-text">리뷰 {g.reviewCount}건</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
