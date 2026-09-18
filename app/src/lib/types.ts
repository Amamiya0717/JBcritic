export type Profile = {
  id: string;
  nickname: string;
  created_at: string;
};

export type Game = {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  color: string;
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
  created_at: string;
  updated_at: string;
};

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
