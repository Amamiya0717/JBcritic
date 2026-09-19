export type Profile = {
  id: string;
  nickname: string;
  created_at: string;
};

export const GAME_CATEGORIES = [
  { value: "game", label: "Games", path: "/" },
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

export type Game = {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  color: string;
  category: GameCategory;
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
