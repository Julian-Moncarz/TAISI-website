import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Team | Toronto AI Safety Initiative",
};

// href is optional: only some of the team have somewhere to point at.
const team: { name: string; role: string; photo: string; href?: string }[] = [
  {
    name: "Joseph Kostousov",
    role: "Co-director and Co-founder",
    photo: "/team/joseph.webp",
    href: "https://josephkostousov.com/",
  },
  {
    name: "Isabel Liu",
    role: "Co-director",
    photo: "/team/isabel.webp",
    href: "https://www.linkedin.com/in/isabel-liu74/",
  },
  {
    name: "Boyan Litchev",
    role: "Special Projects",
    photo: "/team/boyan.webp",
    href: "https://www.linkedin.com/in/boyan-litchev-75a90a342/",
  },
  { name: "Paul Hindoian", role: "Policy Lead", photo: "/team/paul.webp" },
  {
    name: "Julian Moncarz",
    role: "Advisor and Co-founder, Kairos Talent Ops",
    photo: "/team/julian.webp",
  },
];

export default function Team() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <div>
          <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-8 sm:mb-10 font-semibold">
            <span className="text-text">Team</span>
          </h1>
        </div>

        {/* Five across on a wide screen, so the whole team reads as one row.
            One entrance carries the grid, rather than each portrait arriving
            on its own. */}
        <ul className="intro-rise grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {team.map(({ name, role, photo, href }) => {
            const portrait = (
              <>
                {/* The cream ground shows through while the image decodes, so
                    the column does not flash white. */}
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                  />
                </div>
                <p className="mt-3 text-[16px] sm:text-[17px] font-semibold text-text leading-snug transition-colors group-hover:text-accent">
                  {name}
                </p>
              </>
            );
            return (
              <li key={name}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {portrait}
                  </a>
                ) : (
                  portrait
                )}
                <p className="mt-1 text-[14px] sm:text-[15px] text-text-secondary leading-snug">
                  {role}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
