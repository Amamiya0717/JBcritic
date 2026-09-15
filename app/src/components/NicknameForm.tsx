"use client";

import { useState, useTransition } from "react";
import { updateNickname } from "@/lib/actions";

export default function NicknameForm({ initialNickname }: { initialNickname: string }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await updateNickname(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setNickname(String(formData.get("nickname") || nickname));
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="review-form">
        <label className="hint" style={{ display: "block", marginBottom: 6 }}>
          닉네임 설정
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: "1rem" }}>{nickname}</span>
          <button type="button" className="btn" onClick={() => setEditing(true)}>
            수정
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="review-form">
      {error && <p className="form-error">{error}</p>}
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="nickname">닉네임 설정</label>
        <input
          className="input"
          id="nickname"
          name="nickname"
          type="text"
          maxLength={20}
          defaultValue={nickname}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </button>
      <button
        type="button"
        className="btn-text"
        style={{ marginLeft: 10 }}
        onClick={() => setEditing(false)}
      >
        취소
      </button>
    </form>
  );
}
