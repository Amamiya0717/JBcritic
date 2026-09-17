"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

export default function GameThumb({
  coverUrl,
  color,
  title,
  variant = "list",
}: {
  coverUrl: string | null;
  color: string;
  title: string;
  variant?: "list" | "detail" | "wide";
}) {
  const [failed, setFailed] = useState(false);

  if (variant === "wide") {
    if (!coverUrl || failed) {
      return (
        <div className="wide-thumb-fallback" style={{ background: color || "#666666" }}>
          {initials(title)}
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="wide-thumb-img"
        src={coverUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  const size = variant === "list" ? { width: 44, height: 60 } : { width: 110, height: 150 };

  if (!coverUrl || failed) {
    return (
      <div
        className={
          variant === "list" ? "game-thumb-fallback" : "detail-cover-fallback"
        }
        style={{ background: color || "#666666" }}
      >
        {initials(title)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl}
      alt=""
      width={size.width}
      height={size.height}
      referrerPolicy="no-referrer"
      style={{
        width: size.width,
        height: size.height,
        borderRadius: "var(--radius)",
        flexShrink: 0,
        objectFit: "cover",
      }}
      onError={() => setFailed(true)}
    />
  );
}
