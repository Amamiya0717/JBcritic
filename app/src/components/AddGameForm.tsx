"use client";

import { useState, useTransition } from "react";
import { addGame, updateGame } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_FIELDS,
  GAME_CATEGORIES,
  LOOKUP_CATEGORIES,
  type CategoryFieldKey,
  type GameCategory,
  type LookupResult,
} from "@/lib/types";
import LookupBox from "@/components/LookupBox";

const SWATCHES = ["#66cc33", "#ffcc33", "#ff0000", "#3b7bd9", "#8c4bc7", "#666666"];

const COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const COVER_MAX_BYTES = 2 * 1024 * 1024;

export default function AddGameForm({
  gameId,
  initial,
  defaultCategory = "game",
}: {
  gameId?: string;
  initial?: {
    title: string;
    genre: string | null;
    description: string | null;
    coverUrl: string | null;
    color: string;
    category: GameCategory;
  } & Partial<Record<CategoryFieldKey, string | number | null>>;
  defaultCategory?: GameCategory;
}) {
  const [category, setCategory] = useState<GameCategory>(
    initial?.category ?? defaultCategory
  );
  const categoryFields = CATEGORY_FIELDS[category];
  const [color, setColor] = useState(initial?.color ?? SWATCHES[0]);
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [coverFailed, setCoverFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  // 검색 결과를 고르면 입력칸을 그 값으로 다시 그린다 (key가 바뀌어 defaultValue가 새로 적용됨).
  const [prefill, setPrefill] = useState<LookupResult | null>(null);
  const [rev, setRev] = useState(0);

  function applyLookup(result: LookupResult) {
    setPrefill(result);
    setRev((n) => n + 1);
    if (result.coverUrl) {
      setCoverUrl(result.coverUrl);
      setCoverFailed(false);
    }
  }

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");

    const ext = COVER_TYPES[file.type];
    if (!ext) {
      setUploadError("JPG, PNG, WebP 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setUploadError("이미지는 2MB 이하만 올릴 수 있어요.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      setUploadError("로그인 후 이용해주세요.");
      return;
    }

    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("covers")
      .upload(path, file, { contentType: file.type });
    setUploading(false);
    if (uploadErr) {
      setUploadError("업로드에 실패했어요: " + uploadErr.message);
      return;
    }

    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
    setCoverFailed(false);
  }

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = gameId
        ? await updateGame(gameId, formData)
        : await addGame(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="add-form">
      {error && <p className="form-error">{error}</p>}

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="category">카테고리</label>
        <select
          className="select"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as GameCategory)}
        >
          {GAME_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {LOOKUP_CATEGORIES.includes(category) && (
        <LookupBox key={category} category={category} onSelect={applyLookup} />
      )}

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="title">제목</label>
        <input
          className="input"
          id="title"
          name="title"
          type="text"
          placeholder="예: 리썰컴퍼니"
          key={`title-${rev}`}
          defaultValue={prefill ? prefill.title : initial?.title}
        />
      </div>

      {categoryFields.map((f) => (
        <div className="field" style={{ marginBottom: 12 }} key={`${f.key}-${rev}`}>
          <label htmlFor={f.key}>{f.label}</label>
          <input
            className="input"
            id={f.key}
            name={f.key}
            type={f.type === "date" ? "date" : f.type === "year" ? "number" : "text"}
            defaultValue={(prefill ? prefill.fields[f.key] : initial?.[f.key]) ?? undefined}
          />
        </div>
      ))}

      <div className="field" style={{ marginBottom: 12 }} key={`genre-${rev}`}>
        <label htmlFor="genre">장르 (선택)</label>
        <input
          className="input"
          id="genre"
          name="genre"
          type="text"
          placeholder="예: 협동 호러"
          defaultValue={(prefill ? prefill.genre : initial?.genre) ?? undefined}
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }} key={`description-${rev}`}>
        <label htmlFor="description">간단 설명 (선택)</label>
        <textarea
          className="input"
          id="description"
          name="description"
          placeholder="어떤 작품인지 짧게 적어주세요"
          defaultValue={(prefill ? prefill.description : initial?.description) ?? undefined}
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="coverFile">커버 이미지 업로드 (선택)</label>
        <input
          className="input"
          id="coverFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={handleCoverFile}
        />
        <p className="meta-text" style={{ margin: "6px 0 0" }}>
          JPG, PNG, WebP · 2MB 이하. 올리면 아래 URL 칸이 자동으로 채워져요.
        </p>
        {uploading && (
          <p className="meta-text" style={{ margin: "6px 0 0" }}>
            업로드 중...
          </p>
        )}
        {uploadError && (
          <p className="form-error" style={{ margin: "6px 0 0" }}>
            {uploadError}
          </p>
        )}
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="coverUrl">또는 커버 이미지 URL</label>
        <input
          className="input"
          id="coverUrl"
          name="coverUrl"
          type="url"
          placeholder="https://..."
          value={coverUrl}
          onChange={(e) => {
            setCoverUrl(e.target.value);
            setCoverFailed(false);
          }}
        />
      </div>

      {coverUrl && (
        <div style={{ marginBottom: 12 }}>
          {coverFailed ? (
            <p className="form-error" style={{ margin: 0 }}>
              이미지를 불러올 수 없어요.
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="미리보기"
              onError={() => setCoverFailed(true)}
              style={{
                width: 80,
                height: 112,
                objectFit: "cover",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                display: "block",
              }}
            />
          )}
        </div>
      )}
      <input type="hidden" name="color" value={color} />

      <div className="field" style={{ marginBottom: 20 }}>
        <label>대체 색상 (이미지가 없거나 안 불러와질 때 표시)</label>
        <div className="swatch-row">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${color === c ? " selected" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-gold" disabled={pending || uploading}>
        {pending ? "저장 중..." : gameId ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
