"use client";

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = { q: string; a: ReactNode };

/**
 * The design system's accordion: rows separated by hairlines, each question a
 * full-width button with a plus or minus sign on the right, and the answer
 * below it. Any number of rows can be open at once.
 */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set());

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="border-b border-ink/12">
      {items.map(({ q, a }, i) => {
        const isOpen = open.has(i);
        const buttonId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div key={q} className="border-t border-ink/12">
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="w-full flex items-start justify-between gap-6 py-5 text-left text-[16px] font-medium leading-[1.5] text-ink cursor-pointer"
              >
                <span>{q}</span>
                {/* One glyph that turns: the vertical stroke folds away, so
                    plus becomes minus in place rather than swapping. */}
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  className="shrink-0 mt-[5px] text-mute"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <line x1="1" y1="7" x2="13" y2="7" />
                  <line
                    x1="7"
                    y1="1"
                    x2="7"
                    y2="13"
                    className="origin-center transition-transform duration-300"
                    style={{ transform: isOpen ? "scaleY(0)" : "none" }}
                  />
                </svg>
              </button>
            </h3>
            {/* Grid rows animate to the answer's own height without
                measuring it. inert keeps a closed answer out of the tab
                order and away from screen readers. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-settle)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div
                  className="pb-6 pr-10 t-body transition-opacity duration-300"
                  style={{ opacity: isOpen ? 1 : 0 }}
                >
                  {a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
