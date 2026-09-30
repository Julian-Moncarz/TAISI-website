import type { ReactNode } from "react";
import GeoObject from "./geo/GeoObject";
import SectionIcon from "./SectionIcon";
import type { GeoKind } from "./geo/objects";

/**
 * The top of every page except the home page: the title and intro on the
 * left, the page's object on the right. The title always starts at the same
 * height and the object is always the same size, so moving between pages
 * nothing jumps. On phones the object shrinks to an icon above the title.
 * Without an object the title and content run the full width; `icon` puts
 * a small object above the title instead, as a section does.
 */
export default function PageHero({
  title,
  object,
  play = "loop",
  icon,
  children,
}: {
  title: ReactNode;
  object?: GeoKind;
  /** A section-sized object above the title, for pages with no hero object. */
  icon?: GeoKind;
  /** Heroes loop; form pages play once so the form stays the focus. */
  play?: "loop" | "mount";
  children?: ReactNode;
}) {
  return (
    <section>
      <div
        className={`container-site pt-12 pb-16 md:pt-20 md:pb-24 grid grid-cols-1 gap-x-16 items-start ${
          object ? "md:grid-cols-[minmax(0,1fr)_minmax(0,340px)]" : ""
        }`}
      >
        <div className="intro-rise flex flex-col gap-8 min-w-0">
          {object && <SectionIcon kind={object} play="mount" className="md:hidden" />}
          {icon && <SectionIcon kind={icon} play="mount" className="mb-2" />}
          <h1 className="t-display">{title}</h1>
          {children}
        </div>
        {object && (
          <div className="hidden md:block w-full aspect-square">
            <GeoObject kind={object} play={play} />
          </div>
        )}
      </div>
    </section>
  );
}
