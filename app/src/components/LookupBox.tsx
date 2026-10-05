"use client";

import { useState } from "react";
import type { GameCategory, LookupResult } from "@/lib/types";

const HINTS: Partial<Record<GameCategory, string>> = {
  game: "RAWG에서 검색해요. 영문 제목으로 검색하세요. 결과는 영문 제목이라 필요하면 직접 고쳐주세요.",
  anime: "AniList에서 검색해요. 한글로 안 나오면 영어·일본어 제목으로 검색해 보세요.",
  movies: "TMDB에서 검색해요. 한글 제목도 돼요.",
  music: "iTunes에서 앨범·곡을 검색해요. 한글도 돼요.",
};

export default function LookupBox({
  category,
  onSelect,
}: {
  category: GameCategory;
  onSelect: (result: LookupResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/lookup?category=${category}&q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "검색에 실패했어요.");
      setResults(json.results);
    } catch (e) {
      setResults(null);
      setError(e instanceof Error ? e.message : "검색에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  async function pick(result: LookupResult) {
    let picked = result;
    if (result.needsDetail) {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/lookup?category=${category}&id=${result.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "상세 정보를 가져오지 못했어요.");
        picked = { ...result, fields: { ...result.fields, ...json.fields } };
      } catch (e) {
        // 상세(감독 등)를 못 가져와도 기본 정보는 채운다.
        setError(
          (e instanceof Error ? e.message : "상세 정보를 가져오지 못했어요.") +
            " 기본 정보만 채웠어요."
        );
      } finally {
        setLoading(false);
      }
    }
    onSelect(picked);
    setResults(null);
  }

  return (
    <div className="lookup-box">
      <label htmlFor="lookupQuery">정보 검색해서 채우기 (선택)</label>
      <div className="lookup-row">
        <input
          className="input"
          id="lookupQuery"
          type="text"
          placeholder="제목을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // 바깥 등록 폼이 제출되지 않게 막고 검색만 실행한다.
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
        />
        <button type="button" className="btn" onClick={search} disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>
      {HINTS[category] && <p className="meta-text lookup-hint">{HINTS[category]}</p>}
      {error && <p className="form-error lookup-hint">{error}</p>}

      {results && results.length === 0 && (
        <p className="meta-text lookup-hint">검색 결과가 없어요.</p>
      )}
      {results && results.length > 0 && (
        <ul className="lookup-results">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="lookup-item"
                onClick={() => pick(r)}
                disabled={loading}
              >
                {r.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.coverUrl} alt="" className="lookup-thumb" />
                ) : (
                  <span className="lookup-thumb lookup-thumb-empty" />
                )}
                <span className="lookup-text">
                  <span className="lookup-title">{r.title}</span>
                  {r.subtitle && <span className="meta-text">{r.subtitle}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
