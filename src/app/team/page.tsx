import type { Metadata } from "next";
import Image from "next/image";
import CopyEmail from "@/components/CopyEmail";

export const metadata: Metadata = {
  title: "Team | Toronto AI Safety Initiative",
};

// linkedin is optional: not everyone has one to point at.
type Person = {
  name: string;
  role: string;
  org?: string;
  photo: string;
  email: string;
  linkedin?: string;
};

const team: Person[] = [
  {
    name: "Joseph Kostousov",
    role: "Co-director",
    photo: "/team/joseph.webp",
    email: "joseph@taisi.ca",
    linkedin: "https://www.linkedin.com/in/joseph-kostousov",
  },
  {
    name: "Isabel Liu",
    role: "Co-director",
    photo: "/team/isabel.webp",
    email: "isabel@taisi.ca",
    linkedin: "https://www.linkedin.com/in/isabel-liu74/",
  },
  {
    name: "Boyan Litchev",
    role: "Special Projects",
    photo: "/team/boyan.webp",
    email: "boyanlitchev@yahoo.com",
    linkedin: "https://www.linkedin.com/in/boyan-litchev-75a90a342/",
  },
  {
    name: "Paul Hindoian",
    role: "Policy Lead",
    photo: "/team/paul.webp",
    email: "paul.hindoian@mail.utoronto.ca",
  },
  {
    name: "Caitlin Mah",
    role: "Strategy",
    photo: "/team/caitlin.webp",
    email: "clmah918@gmail.com",
    linkedin: "https://www.linkedin.com/in/caitlin-mah",
  },
];

const alumni: Person[] = [
  {
    name: "Julian Moncarz",
    role: "Advisor",
    org: "Kairos Talent Operations",
    photo: "/team/julian.webp",
    email: "moncarz.julian@gmail.com",
    linkedin: "https://www.linkedin.com/in/julian-moncarz",
  },
];

function Portrait({ name, role, org, photo, email, linkedin }: Person) {
  return (
    <li>
      {/* The cream ground shows through while the image decodes, so the
          column does not flash white. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
          className="object-cover"
        />
      </div>
      <p className="mt-3 text-[16px] sm:text-[17px] font-semibold text-text leading-snug">
        {name}
      </p>
      {/* Role on the left, the two buttons against the right edge, so the
          icons line up down the row. */}
      <div className="mt-1 flex items-center gap-x-3">
        <span className="text-[14px] sm:text-[15px] text-text-secondary leading-snug">
          {role}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2.5">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            aria-label={`${name} on LinkedIn`}
            title="LinkedIn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.65h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.65c0-1.35-.03-3.08-1.95-3.08-1.95 0-2.25 1.47-2.25 2.98V21H9z" />
            </svg>
          </a>
        )}
          <CopyEmail email={email} name={name} />
        </span>
      </div>
      {org && (
        <p className="text-[14px] sm:text-[15px] text-text-secondary leading-snug">
          {org}
        </p>
      )}
    </li>
  );
}

// Five across on a wide screen, so the team reads as one row. Alumni sit in
// the same grid underneath, so a portrait is the same size in both.
const GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10";

export default function Team() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-16 md:pb-24">
        <h1 className="section-header mb-5 sm:mb-6">Executive Team</h1>

        {/* One entrance carries the grid, rather than each portrait arriving
            on its own. */}
        <ul className={`intro-rise ${GRID}`}>
          {team.map((person) => (
            <Portrait key={person.name} {...person} />
          ))}
        </ul>

        <h2 className="section-header mt-10 sm:mt-11 mb-5 sm:mb-6">Alumni</h2>
        <ul className={GRID}>
          {alumni.map((person) => (
            <Portrait key={person.name} {...person} />
          ))}
        </ul>
      </section>
    </main>
  );
}
