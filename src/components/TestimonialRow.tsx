"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image?: string;
  imagePosition?: string;
};

export default function TestimonialRow({
  items,
  title,
}: {
  items: Testimonial[];
  title?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  function step(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("figure");
    const distance = card ? card.clientWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  const arrowClass =
    "flex items-center justify-center w-10 h-10 rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-accent";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        {title ? <h2 className="section-header">{title}</h2> : <span />}
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous testimonials"
            className={arrowClass}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="More testimonials"
            className={arrowClass}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bleeds to the container edges so cards can scroll off-screen, with
          the leading and trailing card fading out rather than being clipped */}
      <div
        ref={scroller}
        onScroll={sync}
        className="-mx-5 sm:-mx-8 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: `linear-gradient(to right, ${
            atStart ? "black 0" : "transparent 0"
          }, black 8%, black 92%, ${atEnd ? "black 100%" : "transparent 100%"})`,
          WebkitMaskImage: `linear-gradient(to right, ${
            atStart ? "black 0" : "transparent 0"
          }, black 8%, black 92%, ${atEnd ? "black 100%" : "transparent 100%"})`,
        }}
      >
        <div className="flex gap-5 px-5 sm:px-8 snap-x snap-mandatory">
          {items.map((t, i) => (
            <figure
              key={`${t.name}-${i}`}
              className="snap-start shrink-0 flex flex-col w-[85vw] sm:w-[480px] bg-white border border-accent/70 rounded-lg p-6 sm:p-7"
            >
              <blockquote className="flex-1 text-[15px] sm:text-[16px] leading-[1.65] text-text">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {t.image ? (
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={96}
                    height={96}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    style={{ objectPosition: t.imagePosition ?? "top" }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                )}
                <div>
                  <span className="block text-[15px] font-semibold text-text">
                    {t.name}
                  </span>
                  <span className="block text-[13px] text-text-secondary">
                    {t.role}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
