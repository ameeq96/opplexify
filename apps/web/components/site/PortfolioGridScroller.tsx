"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

export type PortfolioGridItem = {
  name: string;
  src: string;
  title: string;
  tag: string;
  alt?: string | null;
};

type PortfolioGridScrollerProps = {
  items: PortfolioGridItem[];
  batchSize?: number;
  filters?: string[];
};

const allFilter = "All";
const canTiltQuery = "(hover: hover) and (pointer: fine)";

export function PortfolioGridScroller({ items, batchSize = 9, filters }: PortfolioGridScrollerProps) {
  const filterOptions = useMemo(() => {
    const source = filters?.length ? filters : items.map((item) => item.tag);
    return Array.from(new Set(source)).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [filters, items]);
  const [activeFilter, setActiveFilter] = useState(allFilter);
  const canTiltRef = useRef(false);
  const filteredItems = useMemo(
    () => (activeFilter === allFilter ? items : items.filter((item) => item.tag === activeFilter)),
    [activeFilter, items]
  );
  const [visibleCount, setVisibleCount] = useState(() => Math.min(batchSize, items.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;

  useEffect(() => {
    if (activeFilter !== allFilter && !filterOptions.includes(activeFilter)) {
      setActiveFilter(allFilter);
    }
  }, [activeFilter, filterOptions]);

  useEffect(() => {
    setVisibleCount(Math.min(batchSize, filteredItems.length));
  }, [batchSize, filteredItems]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(canTiltQuery);
    const updateCanTilt = () => {
      canTiltRef.current = mediaQuery.matches;
    };

    updateCanTilt();
    mediaQuery.addEventListener("change", updateCanTilt);
    return () => mediaQuery.removeEventListener("change", updateCanTilt);
  }, []);

  useEffect(() => {
    const refresh = () => window.ScrollTrigger?.refresh?.();
    const frame = window.requestAnimationFrame(refresh);
    const timeout = window.setTimeout(refresh, 300);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [visibleCount]);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!canTiltRef.current) return;
    const card = event.currentTarget.querySelector<HTMLElement>(".card");
    if (!card) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const rotateX = (y / rect.height) * -30;
    const rotateY = (x / rect.width) * 30;

    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  };

  const handleLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (!canTiltRef.current) return;
    const card = event.currentTarget.querySelector<HTMLElement>(".card");
    if (card) card.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <>
      <div className="portfolio-filter-bar fade-anim" aria-label="Portfolio filters">
        <button
          type="button"
          className={activeFilter === allFilter ? "active" : ""}
          aria-pressed={activeFilter === allFilter}
          onClick={() => setActiveFilter(allFilter)}
        >
          {allFilter}
        </button>
        {filterOptions.map((filter) => (
          <button
            type="button"
            className={activeFilter === filter ? "active" : ""}
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            key={filter}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="works-16-wrapper portfolio-editorial-grid">
        {visibleItems.map((image, index) => (
          <div
            className="card-wrap portfolio-editorial-card fade-anim"
            data-image={image.src}
            data-tag={image.tag}
            key={image.src}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            <div className="work-box-16 card">
              <a href={image.src} target="_blank" rel="noreferrer">
                <div className="card-bg">
                  <img
                    className="portfolio-card-image"
                    src={image.src}
                    alt={image.alt ?? image.title}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 575px) 100vw, (max-width: 900px) 50vw, 34vw"
                  />
                </div>
              </a>
              <span className="portfolio-card-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="meta">
                <span className="tag">{image.tag}</span>
                <a href={image.src} target="_blank" rel="noreferrer" className="link-arrow">
                  <span className="icon">
                    <span className="first">
                      <i className="fa-solid fa-long-arrow-right" />
                    </span>
                    <span className="second">
                      <i className="fa-solid fa-long-arrow-right" />
                    </span>
                  </span>
                </a>
              </div>
              <div className="content">
                <a href={image.src} target="_blank" rel="noreferrer">
                  <h3 className="title">{image.title}</h3>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 ? <p className="portfolio-empty">No portfolio items found.</p> : null}

      <div className="portfolio-scroll-pagination" ref={sentinelRef}>
        {hasMore ? (
          <button type="button" onClick={() => setVisibleCount((current) => Math.min(current + batchSize, filteredItems.length))}>
            Load more work
          </button>
        ) : null}
      </div>
    </>
  );
}
