import { Lockup } from "./Logo";

// Two short columns, so the links never need more width than a phone has.
// The email address is the way to get in touch; there is no contact form.
// There is no call to action here: the home page's hero and Our programs
// cards carry the "Express interest" buttons.
const columns = [
  [
    { href: "/fellowships", label: "Fellowship" },
    { href: "/resources", label: "Resources" },
    { href: "/team", label: "Team" },
  ],
  [{ href: "mailto:joseph@taisi.ca", label: "joseph@taisi.ca" }],
];

export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-cream">
      <div className="container-site pt-16 pb-14">
        {/* Logo and links share one bottom line; on phones the links drop
            beneath the logo. */}
        <div className="flex flex-wrap justify-between items-end gap-10">
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
