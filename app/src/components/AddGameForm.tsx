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

  const showPreview = !!coverUrl && !coverFailed;

  return (
    <form action={handleSubmit} className="add-form work-form">
      {error && <p className="form-error">{error}</p>}

      <section className="form-section">
        <h3 className="form-section-title">
          <span className="step">1</span>카테고리 · 정보 검색
        </h3>
        <div className="field category-field">
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
      </section>

      <section className="form-section">
        <h3 className="form-section-title">
          <span className="step">2</span>기본 정보
        </h3>
        <div className="form-grid">
          <div className="field span-2" key={`title-${rev}`}>
            <label htmlFor="title">
              제목 <span className="optional required">필수</span>
            </label>
            <input
              className="input"
              id="title"
              name="title"
              type="text"
              placeholder="예: 리썰컴퍼니"
              defaultValue={prefill ? prefill.title : initial?.title}
            />
          </div>

          {categoryFields.map((f) => (
            <div className="field" key={`${f.key}-${rev}`}>
              <label htmlFor={f.key}>
                {f.label} <span className="optional">선택</span>
              </label>
              <input
                className="input"
                id={f.key}
                name={f.key}
                type={f.type === "date" ? "date" : f.type === "year" ? "number" : "text"}
                defaultValue={
                  (prefill ? prefill.fields[f.key] : initial?.[f.key]) ?? undefined
                }
              />
            </div>
          ))}

          <div className="field" key={`genre-${rev}`}>
            <label htmlFor="genre">
              장르 <span className="optional">선택</span>
            </label>
            <input
              className="input"
              id="genre"
              name="genre"
              type="text"
              placeholder="예: 협동 호러"
              defaultValue={(prefill ? prefill.genre : initial?.genre) ?? undefined}
            />
          </div>

          <div className="field span-2" key={`description-${rev}`}>
            <label htmlFor="description">
              간단 설명 <span className="optional">선택</span>
            </label>
            <textarea
              className="input"
              id="description"
              name="description"
              placeholder="어떤 작품인지 짧게 적어주세요"
              defaultValue={
                (prefill ? prefill.description : initial?.description) ?? undefined
              }
            />
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3 className="form-section-title">
          <span className="step">3</span>커버 이미지
        </h3>
        <div className="cover-grid">
          <div
            className="cover-preview"
            style={showPreview ? undefined : { background: color }}
          >
            {showPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="커버 미리보기" onError={() => setCoverFailed(true)} />
            ) : (
              <span>{coverFailed ? "이미지를 불러올 수 없어요" : "미리보기"}</span>
            )}
          </div>

          <div className="cover-controls">
            <div className="field">
              <label htmlFor="coverFile">이미지 파일 올리기</label>
              <div className="file-row">
                <input
                  className="visually-hidden-file"
                  id="coverFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={handleCoverFile}
                />
                <label
                  htmlFor="coverFile"
                  className={`btn btn-lg file-btn${uploading ? " is-disabled" : ""}`}
                >
                  {uploading ? "업로드 중..." : "파일 선택"}
                </label>
                <span className="meta-text">JPG, PNG, WebP · 2MB 이하</span>
              </div>
              {uploadError && <p className="form-error">{uploadError}</p>}
            </div>

            <div className="field">
              <label htmlFor="coverUrl">
                또는 이미지 주소(URL) <span className="optional">선택</span>
              </label>
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

            <input type="hidden" name="color" value={color} />
            <div className="field">
              <label>대체 색상</label>
              <p className="meta-text">이미지가 없거나 안 불러와질 때 이 색으로 표시돼요.</p>
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
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="btn btn-gold btn-lg btn-block"
        disabled={pending || uploading}
      >
        {pending ? "저장 중..." : gameId ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
