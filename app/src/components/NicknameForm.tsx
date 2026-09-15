"use client";

import { useState, useTransition } from "react";
import { updateNickname } from "@/lib/actions";

export default function NicknameForm({ initialNickname }: { initialNickname: string }) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateNickname(formData);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="review-form">
      {error && <p className="form-error">{error}</p>}
      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor="nickname">사이트 닉네임</label>
        <input
          className="input"
          id="nickname"
          name="nickname"
          type="text"
          maxLength={20}
          defaultValue={initialNickname}
          onChange={() => setSaved(false)}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </button>
      {saved && !pending && (
        <span className="hint" style={{ marginLeft: 10 }}>
          저장됐어요.
        </span>
      )}
    </form>
  );
}
