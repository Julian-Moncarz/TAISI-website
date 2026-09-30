"use client";

import { usePathname } from "next/navigation";
import { Lockup } from "./Logo";
import { DISCORD_URL, interestFormHref } from "@/lib/links";

// Pages that are themselves the next step, where a "go and express interest"
// block would send people away from the form they are filling in.
const NO_CTA = ["/interest", "/september-fellowship"];

// Two short columns, so the links never need more width than a phone has.
// The email address is the way to get in touch; there is no contact form.
const columns = [
  [
    { href: "/fellowships", label: "Fellowship" },
    { href: "/team", label: "Team" },
  ],
  [{ href: "mailto:joseph@taisi.ca", label: "joseph@taisi.ca" }],
];

export default function Footer() {
  const pathname = usePathname();
  const cta = !NO_CTA.includes(pathname);

  return (
    <footer id="join" className="on-dark bg-ink text-cream">
      <div className={`container-site pb-14 flex flex-col gap-20 md:gap-[120px] ${cta ? "pt-[88px] md:pt-32" : "pt-16"}`}>
        {cta && (
          <div className="flex flex-col gap-10">
            <h2 className="t-section">Interested in the Winter Fellowship?</h2>
            <div className="flex flex-wrap items-center gap-5">
              <a href={interestFormHref("footer")} className="btn btn-gold">
                Express interest
              </a>
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-text">
                  Join our Discord
                </a>
              )}
            </div>
          </div>
        )}

        {/* Logo and links share one bottom line; on phones the links drop
            beneath the logo. */}
        <div
          className={`flex flex-wrap justify-between items-end gap-10 ${
            cta ? "pt-10 border-t border-cream/15" : ""
          }`}
        >
          <Lockup size={60} tone="dark" />
          <div className="flex gap-12 text-[15px] whitespace-nowrap">
            {columns.map((col, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                {col.map(({ href, label }) => (
                  <a key={href} href={href} className="text-cream/75 hover:text-gold transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
