"use client";

import { useState, useTransition } from "react";
import { addGame } from "@/lib/actions";

const SWATCHES = ["#66cc33", "#ffcc33", "#ff0000", "#3b7bd9", "#8c4bc7", "#666666"];

export default function AddGameForm() {
  const [color, setColor] = useState(SWATCHES[0]);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await addGame(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="add-form">
      {error && <p className="form-error">{error}</p>}

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="title">게임 제목</label>
        <input
          className="input"
          id="title"
          name="title"
          type="text"
          placeholder="예: 리썰컴퍼니"
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="genre">장르 (선택)</label>
        <input
          className="input"
          id="genre"
          name="genre"
          type="text"
          placeholder="예: 협동 호러"
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="description">간단 설명 (선택)</label>
        <textarea
          className="input"
          id="description"
          name="description"
          placeholder="어떤 게임인지 짧게 적어주세요"
        />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="coverUrl">커버 이미지 URL (선택)</label>
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
              referrerPolicy="no-referrer"
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

      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "등록 중..." : "등록하기"}
      </button>
    </form>
  );
}
