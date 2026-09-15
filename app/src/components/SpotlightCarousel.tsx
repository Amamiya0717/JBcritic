"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export default function SpotlightCarousel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
    setTimeout(updateEdges, 350);
  }

  return (
    <section className="spotlight-section">
      <div className="spotlight-header">
        <h2 className="spotlight-title">{title}</h2>
        <div className="spotlight-arrows">
          <button
            type="button"
            className="carousel-arrow"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="이전"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="다음"
          >
            ›
          </button>
        </div>
      </div>
      <div className="spotlight-scroll" ref={scrollRef} onScroll={updateEdges}>
        {children}
      </div>
    </section>
  );
}
