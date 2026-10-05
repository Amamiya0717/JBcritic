import type { GameCategory, LookupResult } from "@/lib/types";

export class LookupError extends Error {}

const TIMEOUT_MS = 8000;
const MAX_RESULTS = 8;

function clip(text: string | null | undefined, max = 300): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\(Source:[^)]*\)/gi, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ");
  return clip(text);
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new LookupError(`외부 서비스 응답 오류 (${res.status})`);
  return res.json();
}

// ── 애니: AniList (키 불필요) ─────────────────────────────────────
type AniListMedia = {
  id: number;
  title: { romaji: string | null; english: string | null; native: string | null };
  coverImage: { large: string | null } | null;
  genres: string[] | null;
  seasonYear: number | null;
  description: string | null;
  studios: { nodes: { name: string }[] } | null;
};

const ANILIST_QUERY = `query($s:String,$n:Int){Page(perPage:$n){media(search:$s,type:ANIME,sort:SEARCH_MATCH){
  id title{romaji english native} coverImage{large} genres seasonYear description(asHtml:false)
  studios(isMain:true){nodes{name}}}}}`;

async function searchAnime(q: string): Promise<LookupResult[]> {
  const json = (await getJson("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { s: q, n: MAX_RESULTS } }),
  })) as { data?: { Page?: { media?: AniListMedia[] } } };

  return (json.data?.Page?.media ?? []).map((m) => {
    const title = m.title.english || m.title.romaji || m.title.native || "(제목 없음)";
    const studio = m.studios?.nodes[0]?.name;
    return {
      id: String(m.id),
      title,
      subtitle:
        [m.title.native !== title ? m.title.native : null, m.seasonYear]
          .filter(Boolean)
          .join(" · ") || null,
      genre: m.genres?.length ? m.genres.slice(0, 3).join(", ") : null,
      description: stripHtml(m.description),
      coverUrl: m.coverImage?.large ?? null,
      fields: studio ? { studio } : {},
    };
  });
}

// ── 영화: TMDB (TMDB_API_KEY 필요) ────────────────────────────────
const TMDB = "https://api.themoviedb.org/3";

function tmdbRequest(path: string, params: Record<string, string> = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new LookupError("영화 검색용 TMDB_API_KEY가 아직 설정되지 않았어요.");
  const url = new URL(TMDB + path);
  url.searchParams.set("language", "ko-KR");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // v4 읽기 토큰(JWT)이면 Bearer로, v3 키면 쿼리로 보낸다.
  const isToken = key.length > 60;
  if (!isToken) url.searchParams.set("api_key", key);
  return getJson(url.toString(), {
    headers: isToken ? { Authorization: `Bearer ${key}` } : undefined,
    next: { revalidate: 3600 },
  });
}

type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
};

async function searchMovies(q: string): Promise<LookupResult[]> {
  const [search, genreList] = await Promise.all([
    tmdbRequest("/search/movie", { query: q, include_adult: "false" }) as Promise<{
      results?: TmdbMovie[];
    }>,
    tmdbRequest("/genre/movie/list") as Promise<{ genres?: { id: number; name: string }[] }>,
  ]);
  const genreNames = new Map((genreList.genres ?? []).map((g) => [g.id, g.name]));

  return (search.results ?? []).slice(0, MAX_RESULTS).map((m) => {
    const year = m.release_date?.slice(0, 4);
    const genres = m.genre_ids.map((id) => genreNames.get(id)).filter(Boolean);
    return {
      id: String(m.id),
      title: m.title,
      subtitle:
        [m.original_title !== m.title ? m.original_title : null, year]
          .filter(Boolean)
          .join(" · ") || null,
      genre: genres.length ? genres.slice(0, 3).join(", ") : null,
      description: clip(m.overview),
      coverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      fields: {},
      needsDetail: true,
    };
  });
}

export async function movieDetail(id: string): Promise<LookupResult["fields"]> {
  const movie = (await tmdbRequest(`/movie/${id}`, {
    append_to_response: "credits",
  })) as { credits?: { crew?: { job: string; name: string }[] } };
  const director = movie.credits?.crew?.find((c) => c.job === "Director")?.name;
  return director ? { director } : {};
}

// ── 음악: iTunes Search (키 불필요) ───────────────────────────────
// country=KR 스토어는 검색 결과가 비어서 기본 스토어(US)를 쓴다. 한글 검색도 된다.
type ItunesItem = {
  collectionId?: number;
  trackId?: number;
  collectionName?: string;
  trackName?: string;
  artistName: string;
  releaseDate?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
};

async function itunes(term: string, entity: "album" | "song"): Promise<ItunesItem[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", entity);
  url.searchParams.set("country", "US");
  url.searchParams.set("limit", "5");
  const json = (await getJson(url.toString())) as { results?: ItunesItem[] };
  return json.results ?? [];
}

function itunesResult(item: ItunesItem, kind: "album" | "song"): LookupResult {
  const year = Number(item.releaseDate?.slice(0, 4));
  const isAlbum = kind === "album";
  return {
    id: `${kind}-${isAlbum ? item.collectionId : item.trackId}`,
    title: (isAlbum ? item.collectionName : item.trackName) ?? "(제목 없음)",
    subtitle: [item.artistName, !isAlbum ? item.collectionName : null, isAlbum ? "앨범" : "곡"]
      .filter(Boolean)
      .join(" · "),
    genre: item.primaryGenreName ?? null,
    description: null,
    coverUrl: item.artworkUrl100?.replace("100x100bb", "600x600bb") ?? null,
    fields: {
      artist: item.artistName,
      ...(Number.isFinite(year) && year > 0 ? { release_year: year } : {}),
    },
  };
}

async function searchMusic(q: string): Promise<LookupResult[]> {
  const [albums, songs] = await Promise.all([itunes(q, "album"), itunes(q, "song")]);
  return [
    ...albums.map((a) => itunesResult(a, "album")),
    ...songs.map((s) => itunesResult(s, "song")),
  ];
}

// ── 게임: RAWG (RAWG_API_KEY 필요) ────────────────────────────────
const RAWG = "https://api.rawg.io/api";

// RAWG 장르는 영문뿐이라 자주 쓰는 것만 한글로 바꾸고, 나머지는 그대로 둔다.
const RAWG_GENRES_KO: Record<string, string> = {
  Action: "액션",
  Adventure: "어드벤처",
  "Role-playing (RPG)": "RPG",
  RPG: "RPG",
  Shooter: "슈팅",
  Strategy: "전략",
  Puzzle: "퍼즐",
  Racing: "레이싱",
  Sports: "스포츠",
  Simulation: "시뮬레이션",
  Platformer: "플랫포머",
  Fighting: "격투",
  Arcade: "아케이드",
  Casual: "캐주얼",
  Indie: "인디",
  Family: "가족",
  "Board Games": "보드게임",
  Educational: "교육",
  Card: "카드",
  "Massively Multiplayer": "MMO",
};

function rawgRequest(path: string, params: Record<string, string> = {}) {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new LookupError("게임 검색용 RAWG_API_KEY가 아직 설정되지 않았어요.");
  const url = new URL(RAWG + path);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return getJson(url.toString(), { next: { revalidate: 3600 } });
}

type RawgGame = {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  genres?: { name: string }[];
};

async function searchGames(q: string): Promise<LookupResult[]> {
  const json = (await rawgRequest("/games", {
    search: q,
    page_size: String(MAX_RESULTS),
  })) as { results?: RawgGame[] };

  return (json.results ?? []).map((g) => {
    const year = Number(g.released?.slice(0, 4));
    const genres = (g.genres ?? []).map((x) => RAWG_GENRES_KO[x.name] ?? x.name);
    return {
      id: String(g.id),
      title: g.name,
      subtitle: g.released ? g.released.slice(0, 4) : null,
      genre: genres.length ? genres.slice(0, 3).join(", ") : null,
      description: null,
      // 원본은 크지만 카드/목록에는 작은 크롭본이면 충분하다.
      coverUrl:
        g.background_image?.replace("/media/games/", "/media/crop/600/400/games/") ?? null,
      fields: Number.isFinite(year) && year > 0 ? { release_year: year } : {},
      needsDetail: true,
    };
  });
}

export async function gameDetail(id: string): Promise<LookupResult["fields"]> {
  const game = (await rawgRequest(`/games/${id}`)) as {
    developers?: { name: string }[];
  };
  const studio = game.developers?.[0]?.name;
  return studio ? { studio } : {};
}

export async function searchByCategory(
  category: GameCategory,
  q: string
): Promise<LookupResult[]> {
  if (category === "game") return searchGames(q);
  if (category === "anime") return searchAnime(q);
  if (category === "movies") return searchMovies(q);
  if (category === "music") return searchMusic(q);
  throw new LookupError("이 카테고리는 자동 검색을 지원하지 않아요.");
}

// 검색 목록에 없는 정보(영화 감독, 게임 개발사)를 선택 시점에 가져온다.
export async function detailByCategory(
  category: GameCategory,
  id: string
): Promise<LookupResult["fields"]> {
  if (category === "movies") return movieDetail(id);
  if (category === "game") return gameDetail(id);
  throw new LookupError("이 카테고리는 상세 조회를 지원하지 않아요.");
}
