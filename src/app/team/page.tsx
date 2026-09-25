import type { Metadata } from "next";
import Image from "next/image";
import CopyEmail from "@/components/CopyEmail";

export const metadata: Metadata = {
  title: "Team | Toronto AI Safety Initiative",
};

// linkedin is optional: not everyone has one to point at.
type Person = {
  name: string;
  blur: string;
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
    blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoMAA8AA4BaJaACxC8AFAvuhEgAAP6IzTwPlVnf2YCM9rCQpwo2mTrwMqNs7wTNPOBLEjwp/KGdJwbMNVgAAA==",
    email: "joseph@taisi.ca",
    linkedin: "https://www.linkedin.com/in/joseph-kostousov",
  },
  {
    name: "Isabel Liu",
    role: "Co-director",
    photo: "/team/isabel.webp",
    blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoMAA8AA4BaJYwCdIExE4B0Si3gAP5+oecPIWcLt9mOM2s2qaWqRM/8ixcZT9wUcN2EAFpy14kuf9rgAAA=",
    email: "isabel@taisi.ca",
    linkedin: "https://www.linkedin.com/in/isabel-liu74/",
  },
  {
    name: "Boyan Litchev",
    role: "Special Projects",
    photo: "/team/boyan.webp",
    blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoMAA8AA4BaJaACdAELXEZZU8mAAP6Fh/ZWLyIcK3QbsM1jTKGEPzIz0lGunqBcWr5TZuD7VZU504bL0X+CD+oZAAA=",
    email: "boyanlitchev@yahoo.com",
    linkedin: "https://www.linkedin.com/in/boyan-litchev-75a90a342/",
  },
  {
    name: "Paul Hindoian",
    role: "Policy Lead",
    photo: "/team/paul.webp",
    blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAAAQAgCdASoMAA8AA4BaJYwCdADdsTfeF2gYAP7n4bdv/ZLNcAQz+gsmIUiCjlA7i7PhW9LV10c23JlwfbgrU/AA",
    email: "paul.hindoian@mail.utoronto.ca",
  },
  {
    name: "Caitlin Mah",
    role: "Strategy",
    photo: "/team/caitlin.webp",
    blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAgCdASoMAA8AA4BaJQBOj+ADA3/USF1WwAD+8wOIXPCXOR2pVtTpS5eWfR1ReqAZd18R/F7zrBqStguJu9Pi+V/5cvLjHr0QAA==",
    email: "clmah918@gmail.com",
    linkedin: "https://www.linkedin.com/in/caitlin-mah",
  },
];

const operations: Person[] = [
  {
    name: "Elizabeth Gratton",
    role: "Operations",
    photo: "/team/elizabeth.webp",
    blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAwAgCdASoMAA8AA4BaJYgCdADz9bT+vCcMgAD+vdVAoIMIvuOSupZYv54LWBu6I6S4H2AxYEDKusAbWsihG1YEBkz6XoXLRm+WxM+NqqfgVAAA",
    email: "emgratton@gmail.com",
  },
  {
    name: "Ilyass Mofaddel",
    role: "Operations",
    photo: "/team/ilyass.webp",
    blur: "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAQCdASoMAA8AA4BaJQBOgB0+KTUBHIAA/vQMTV5JX+Odv+QrJcOJeQ7kDc9Tbj3Y77BCKxF/+CLBarEWWVlusmyjam2agOUHBrUapO0bFUCFqbAy1jE/OAAAAA==",
    email: "ilyassmofaddel@gmail.com",
    linkedin: "https://www.linkedin.com/in/ilyass-mofaddel/",
  },
  {
    name: "Pera Kasemsripitak",
    role: "Operations",
    photo: "/team/pera.webp",
    blur: "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAwAgCdASoMAA8AA4BaJZQCdAEfoB7VjfIygAD89y6+OtKUbQ7hC1IBDXstYXQVfrPfv6Msyeuy42eisQEiCjo+Klpr+By6Zi0DuFCv92c9xYcfRso2CnLrzBM4AA==",
    email: "pkasemsripitak@gmail.com",
    linkedin: "https://www.linkedin.com/in/perakasem",
  },
  {
    name: "Pio Binawan",
    role: "Operations",
    photo: "/team/pio.webp",
    blur: "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAACQAgCdASoMAA8AA4BaJZACdAYwnwURi+C9ctAwAAD+t7DVwl5eX/EvMQ1tpSXbeVOBNJ4KAUeFY3agdx+RXMIuPkEkyPPOX9b7N4tWTLpiN2mYOhfeRtULSBhZKuGelf83/Ih8q0QiAA==",
    email: "pio.binawan@mail.utoronto.ca",
    linkedin: "https://www.linkedin.com/in/pio-binawan",
  },
];

const alumni: Person[] = [
  {
    name: "Julian Moncarz",
    role: "Advisor",
    org: "Kairos Talent Operations",
    photo: "/team/julian.webp",
    blur: "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAABQAgCdASoMAA8AA4BaJYgCdIExE6zL60D26AAA/aOT5T43tlDcvmso2/umdRjdPDBSntjYSqYvWQAA",
    email: "moncarz.julian@gmail.com",
    linkedin: "https://www.linkedin.com/in/julian-moncarz",
  },
];

function Portrait({ name, role, org, photo, blur, email, linkedin }: Person) {
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
          placeholder="blur"
          blurDataURL={blur}
          priority
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

// Five across on a wide screen, so the team reads as one row. Operations and
// alumni sit in the same grid underneath, so a portrait is the same size in both.
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

        <h2 className="section-header mt-10 sm:mt-11 mb-5 sm:mb-6">Operations Team</h2>
        <ul className={GRID}>
          {operations.map((person) => (
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
