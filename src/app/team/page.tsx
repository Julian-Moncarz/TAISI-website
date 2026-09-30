import type { Metadata } from "next";
import Image from "next/image";
import CopyEmail from "@/components/CopyEmail";
import Section from "@/components/Section";
import PageHero from "@/components/PageHero";

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
  {
    name: "Julian Moncarz",
    role: "Advisor",
    org: "Kairos Talent Operations",
    photo: "/team/julian.webp",
    blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoMAA8AA4BaJZgCdAD0tEKEb5wAAP7u5LzD/fy2MbGRZ+HG5pCe3lrayNbP1Y7t3TLcZ2B4bwSNEH3tx2A2/jdGQqxUzXX4CiY7wCtprsFGAAAA",
    email: "moncarz.julian@gmail.com",
    linkedin: "https://www.linkedin.com/in/julian-moncarz",
  },
];

const operations: Person[] = [
  {
    name: "Aris Kouloukis",
    role: "Operations",
    photo: "/team/aris.webp",
    blur: "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAQAgCdASoMAA8AA4BaJYgCdAECphoeVSToAP7yNVzDgjLhb2LxRlq00la97yn8nDUqRqeFQrvLhpXJ5eJRYpdftKP8LOfy71XJk9NXi4HSliW8J4YBg/KcMN7UAA==",
    email: "ariseros8@gmail.com",
  },
  {
    name: "Elizabeth Gratton",
    role: "Operations",
    photo: "/team/elizabeth.webp",
    blur: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADwAQCdASoMAA8AA4BaJQBOgB06o/jmwWAA/s7P3xRlGJkQnBYM+O3ddqPv+T6KtQo8jhePbkJnHeoq/xyLb4BIDpOLNtOc/aT8Gejlc1DtfD2E94dAAA==",
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
    blur: "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAABwAgCdASoMAA8AA4BaJYgCdAYuvyfNyw4YD3vAAP7KOQt5uP+wGe8yzx/zxteNHQQ873udTMQRJhwWWJeBNeIlwK96AAU79dNk6ljsnotiBNKsZg3eX3R6q2cSiAAA",
    email: "pio.binawan@mail.utoronto.ca",
    linkedin: "https://www.linkedin.com/in/pio-binawan",
  },
];

function Portrait({ name, role, org, photo, blur, email, linkedin }: Person) {
  return (
    <li className="flex flex-col">
      {/* The cream ground shows through while the image decodes, so the
          circle does not flash white. */}
      <div className="relative w-full max-w-[168px] aspect-square overflow-hidden rounded-full bg-cream">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="168px"
          placeholder="blur"
          blurDataURL={blur}
          priority
          className="object-cover"
        />
      </div>
      <p className="mt-5 t-name">{name}</p>
      <p className="mt-0.5 t-role">{role}</p>
      {org && <p className="t-role">{org}</p>}
      <span className="mt-3 flex items-center gap-3">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex p-1 -m-1 text-mute hover:text-ink transition-colors"
            aria-label={`${name} on LinkedIn`}
            title="LinkedIn"
          >
            {/* Outlined, at the same weight as the email icon beside it. */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2.5" y="2.5" width="19" height="19" rx="2" />
              <path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v3.5" />
            </svg>
          </a>
        )}
        <CopyEmail email={email} name={name} />
      </span>
    </li>
  );
}

// Six across on a wide screen, so the executive team reads as one row.
// Operations sits in the same grid underneath, so a portrait is the same size
// in both. The gaps follow the home page quote grid.
const GRID =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-10 gap-y-12";

export default function Team() {
  return (
    <main>
      <PageHero title="Executive team" icon="fold">
        <ul className={`m-0 p-0 list-none ${GRID}`}>
          {team.map((person) => (
            <Portrait key={person.name} {...person} />
          ))}
        </ul>
      </PageHero>

      <Section object="stack" title="Operations team">
        <ul className={`m-0 p-0 list-none ${GRID}`}>
          {operations.map((person) => (
            <Portrait key={person.name} {...person} />
          ))}
        </ul>
      </Section>
    </main>
  );
}
