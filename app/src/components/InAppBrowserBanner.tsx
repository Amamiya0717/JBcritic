"use client";

import { useState, useSyncExternalStore } from "react";

const IN_APP_PATTERNS = [
  /Discord/i,
  /FBAN|FBAV/i, // Facebook
  /Instagram/i,
  /KAKAOTALK/i,
  /Line\//i,
  /MicroMessenger/i, // WeChat
  /NAVER\(/i,
];

const DISMISS_KEY = "jbcritic-iab-banner-dismissed";

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  const ua = navigator.userAgent || "";
  if (!IN_APP_PATTERNS.some((re) => re.test(ua))) return false;
  try {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return false;
  } catch {
    // sessionStorage unavailable; still show the banner
  }
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

function getUserAgent(): string {
  return navigator.userAgent || "";
}
function getServerUserAgent(): string {
  return "";
}

export default function InAppBrowserBanner() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ua = useSyncExternalStore(subscribe, getUserAgent, getServerUserAgent);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  // TEMP DEBUG: figure out what UA Discord's in-app browser actually sends.
  // Remove this block once we've calibrated IN_APP_PATTERNS.
  const debugUa = ua ? (
    <div
      style={{
        background: "#000",
        color: "#0f0",
        fontSize: "10px",
        padding: "6px 10px",
        wordBreak: "break-all",
      }}
    >
      UA: {ua}
    </div>
  ) : null;

  if (!shouldShow || dismissed) return <>{debugUa}</>;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the URL is still visible for manual copy
    }
  }

  return (
    <div className="iab-banner">
      <p>
        지금 앱 내장 브라우저로 보고 계세요. 이 상태에서는 로그인이 저장되지
        않아 매번 다시 로그인해야 해요. 오른쪽 위 <b>···</b> 메뉴에서{" "}
        <b>다른 브라우저로 열기</b>를 선택해주세요.
      </p>
      <div className="iab-banner-actions">
        <button type="button" className="btn btn-gold" onClick={copyLink}>
          {copied ? "복사됨" : "링크 복사"}
        </button>
        <button type="button" className="btn-text" onClick={dismiss}>
          닫기
        </button>
      </div>
    </div>
  );
}
