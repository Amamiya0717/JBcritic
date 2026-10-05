export type Profile = {
  id: string;
  nickname: string;
  created_at: string;
};

export const GAME_CATEGORIES = [
  { value: "game", label: "Games", path: "/games" },
  { value: "anime", label: "Anime", path: "/anime" },
  { value: "movies", label: "Movies", path: "/movies" },
  { value: "music", label: "Music", path: "/music" },
  { value: "lives", label: "Lives", path: "/lives" },
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number]["value"];

export function isGameCategory(value: string): value is GameCategory {
  return GAME_CATEGORIES.some((c) => c.value === value);
}

export function categoryPath(category: GameCategory): string {
  return GAME_CATEGORIES.find((c) => c.value === category)?.path ?? "/";
}

export function categoryLabel(category: GameCategory): string {
  return GAME_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export type CategoryFieldKey =
  | "studio"
  | "director"
  | "artist"
  | "release_year"
  | "venue"
  | "event_date";

export type CategoryField = {
  key: CategoryFieldKey;
  label: string;
  type: "text" | "year" | "date";
};

export const CATEGORY_FIELD_KEYS: CategoryFieldKey[] = [
  "studio",
  "director",
  "artist",
  "release_year",
  "venue",
  "event_date",
];

export const CATEGORY_FIELDS: Record<GameCategory, CategoryField[]> = {
  game: [],
  anime: [{ key: "studio", label: "제작사", type: "text" }],
  movies: [{ key: "director", label: "감독", type: "text" }],
  music: [
    { key: "artist", label: "아티스트", type: "text" },
    { key: "release_year", label: "발매년도", type: "year" },
  ],
  lives: [
    { key: "artist", label: "출연자", type: "text" },
    { key: "venue", label: "공연 장소", type: "text" },
    { key: "event_date", label: "공연일자", type: "date" },
  ],
};

// 외부 서비스(AniList/TMDB/iTunes)로 등록 폼을 자동 채울 수 있는 카테고리.
export const LOOKUP_CATEGORIES: GameCategory[] = ["anime", "movies", "music"];

export type LookupResult = {
  id: string;
  title: string;
  subtitle: string | null;
  genre: string | null;
  description: string | null;
  coverUrl: string | null;
  fields: Partial<Record<CategoryFieldKey, string | number>>;
  // 목록 검색에는 없는 정보(영화 감독 등)를 선택 시점에 따로 가져와야 하는 경우.
  needsDetail?: boolean;
};

export type Game = {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  color: string;
  category: GameCategory;
  studio: string | null;
  director: string | null;
  artist: string | null;
  release_year: number | null;
  venue: string | null;
  event_date: string | null;
  added_by: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: Profile | null;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PostVote = {
  post_id: string;
  user_id: string;
  value: 1 | -1;
};

export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MAX_LENGTH = 5000;

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile | null;
};

export type GameWithStats = Game & {
  avgScore: number | null;
  reviewCount: number;
};

export function withStats(game: Game, reviews: { score: number }[]): GameWithStats {
  const reviewCount = reviews.length;
  const avgScore = reviewCount
    ? Math.round(reviews.reduce((sum, r) => sum + r.score, 0) / reviewCount)
    : null;
  return { ...game, avgScore, reviewCount };
}

export const SORT_OPTIONS = [
  { value: "score-desc", label: "점수 높은순" },
  { value: "score-asc", label: "점수 낮은순" },
  { value: "recent", label: "최근 등록순" },
  { value: "reviews", label: "리뷰 많은순" },
  { value: "title", label: "이름순" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export function isSortKey(value: string): value is SortKey {
  return SORT_OPTIONS.some((o) => o.value === value);
}

export function sortGames(games: GameWithStats[], sort: SortKey): GameWithStats[] {
  const result = [...games];
  result.sort((a, b) => {
    if (sort === "score-desc") return (b.avgScore ?? -1) - (a.avgScore ?? -1);
    if (sort === "score-asc") return (a.avgScore ?? 999) - (b.avgScore ?? 999);
    if (sort === "recent")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "reviews") return b.reviewCount - a.reviewCount;
    if (sort === "title") return a.title.localeCompare(b.title, "ko");
    return 0;
  });
  return result;
}

export const GAMES_PAGE_SIZE = 20;
