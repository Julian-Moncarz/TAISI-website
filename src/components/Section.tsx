import type { ReactNode } from "react";
import SectionIcon from "./SectionIcon";
import type { GeoKind } from "./geo/objects";

/**
 * The page section from the design: a hairline above, generous padding, and
 * optionally a geometric object that plays as the section scrolls into view,
 * sitting over the heading. The object is the section's entrance, so the
 * content itself does not animate in.
 */
export default function Section({
  id,
  object,
  title,
  children,
  rule = true,
  flush = false,
  className = "",
}: {
  id?: string;
  object?: GeoKind;
  title?: ReactNode;
  children?: ReactNode;
  rule?: boolean;
  /** Carries straight on from the section above: no rule, no top padding. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`${rule && !flush ? "section-rule" : ""} scroll-mt-[76px] ${className}`}>
      <div className={`container-site section-pad flex flex-col gap-10 ${flush ? "!pt-0" : ""}`}>
        {/* Pinned 40px above the heading, with its drawn edge on the
            heading's first letter. */}
        {object && <SectionIcon kind={object} />}
        {title && <h2 className="t-section max-w-[820px]">{title}</h2>}
        {children}
      </div>
    </section>
  );
}
