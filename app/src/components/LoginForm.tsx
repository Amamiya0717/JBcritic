"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDiscordLogin() {
    const supabase = createClient();
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setPending(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="login-box">
      <h2 className="section-title" style={{ borderBottom: "none", marginBottom: 4 }}>
        로그인
      </h2>
      <p>정신병동 멤버만 평가를 남길 수 있어요.</p>
      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-discord" onClick={handleDiscordLogin}>
        디스코드로 로그인
      </button>
      <p className="hint" style={{ marginTop: 8 }}>
        디스코드 앱으로 들어오셨다면, 링크를 길게 눌러 <b>다른 브라우저로 열기</b>를
        선택해주세요. 인앱 브라우저에서는 로그인이 저장되지 않아요.
      </p>

      <div className="divider">또는</div>

      {sent ? (
        <p className="hint">
          {email}로 로그인 링크를 보냈어요. 메일함을 확인해주세요.
        </p>
      ) : (
        <form onSubmit={handleEmailLogin}>
          <div className="field" style={{ marginBottom: 10 }}>
            <input
              className="input"
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "전송 중..." : "이메일로 로그인 링크 받기"}
          </button>
        </form>
      )}
    </div>
  );
}
