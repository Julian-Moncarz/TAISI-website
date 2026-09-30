import type { Metadata } from "next";
import { Lockup, TaisiMark } from "@/components/Logo";
import { LogoAnimations, ObjectBank } from "./ObjectBank";

// The living reference for the design system. Everything on this page is
// rendered from the same tokens, classes and components the site uses, so it
// cannot drift from the real thing. Not linked from the site.

export const metadata: Metadata = {
  title: "Design system | TAISI",
  robots: { index: false, follow: false },
};

const colours = [
  { name: "Aubergine", token: "ink", use: "Type, lines, the dark ground", value: "oklch(0.27 0.09 295)", hex: "#2B1A4D" },
  { name: "Grey", token: "mute", use: "Body copy, captions", value: "oklch(0.45 0.02 295)", hex: "#565360" },
  { name: "White", token: "page", use: "Page and cards", value: "#FFFFFF", hex: "#FFFFFF" },
  { name: "Paper", token: "paper", use: "Alternative page", value: "#FAF8F4", hex: "#FAF8F4" },
  { name: "Cream", token: "cream", use: "Warm ground, text on aubergine", value: "#F6F2EA", hex: "#F6F2EA" },
  { name: "Gold", token: "gold", use: "Actions on aubergine only", value: "oklch(0.8 0.11 67)", hex: "#EDB06E" },
  { name: "Ember", token: "ember", use: "Link hover", value: "oklch(0.48 0.15 -33)", hex: "#873889" },
  { name: "Rose", token: "rose", use: "Errors", value: "oklch(0.55 0.17 15)", hex: "#C03A51" },
];

const bands = Array.from({ length: 11 }, (_, i) => `var(--color-band-${i + 1})`);

const type = [
  { label: "Page title", spec: "t-display · Jost 300 · 38 to 60", cls: "t-display", sample: "We’re a group of U of T students" },
  { label: "Section", spec: "t-section · Jost 300 · 32 to 46", cls: "t-section", sample: "What is AI safety?" },
  { label: "H2", spec: "t-h2 · Jost 300 · 26 to 34", cls: "t-h2", sample: "Where you can work" },
  { label: "H3", spec: "t-h3 · Jost 300 · 24 to 30", cls: "t-h3", sample: "Reading Group" },
  { label: "H4", spec: "t-h4 · Jost 400 · 22", cls: "t-h4", sample: "Fellowship" },
  { label: "Lead", spec: "t-lead · Jost 300 · 22 to 26", cls: "t-lead", sample: "AI safety is the field working to change that." },
  { label: "Quote", spec: "t-quote · Jost 300 · 22", cls: "t-quote", sample: "“The most important problem of our time.”" },
  { label: "Body", spec: "t-body · Geist 400 · 16 / 1.7", cls: "t-body max-w-[620px]", sample: "Six weekly sessions over dinner at an off-campus AI safety hub." },
  { label: "Name", spec: "t-name · Geist 500 · 15", cls: "t-name", sample: "Jacob Tsimerman" },
  { label: "Role", spec: "t-role · Geist 400 · 14", cls: "t-role", sample: "Fields Medalist, U of T" },
  { label: "Small", spec: "t-small · Geist 400 · 14", cls: "t-small", sample: "Applications close August 22." },
  { label: "Label", spec: "t-label · Jost 500 · 12 caps", cls: "t-label text-mute", sample: "For students" },
];

const spacing = [4, 8, 16, 24, 32, 48, 64, 96];

const motion = [
  { name: "Standard · 200ms", curve: "cubic-bezier(0.45, 0, 0.2, 1)", use: "Hovers, toggles" },
  { name: "Settle · 300 to 600ms", curve: "cubic-bezier(0.22, 1, 0.36, 1)", use: "Entrances: intro-rise" },
  { name: "Fade in · 800ms", curve: "cubic-bezier(0.37, 0, 0.63, 1)", use: "intro-fade" },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section-rule py-16 md:py-20 flex flex-col gap-8">
      <h2 className="t-h2">{title}</h2>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="t-label text-mute">{title}</span>
      {children}
    </div>
  );
}

export default function DesignSystem() {
  return (
    <main className="bg-paper">
      <div className="container-site pb-28">
        <header className="pt-16 md:pt-[88px] pb-16 md:pb-20 flex flex-col gap-12">
          <Lockup size={60} />
          <div className="flex flex-col gap-4">
            <h1 className="t-display">Design system</h1>
            <p className="t-body max-w-[640px]">
              The tokens, type, components and objects the site is built from. Tokens live in{" "}
              <code>src/app/globals.css</code>, components in <code>src/components</code>, and the
              objects in <code>src/components/geo</code>.
            </p>
          </div>
        </header>

        <Block title="Logo">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
            <div className="flex flex-col gap-2.5">
              <div className="h-60 bg-page rounded-lg flex items-center justify-center">
                <Lockup size={60} />
              </div>
              <span className="t-small">Primary · &lt;Lockup /&gt;</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="h-60 bg-ink rounded-lg flex items-center justify-center">
                <Lockup size={60} tone="dark" />
              </div>
              <span className="t-small">Reversed · &lt;Lockup tone=&quot;dark&quot; /&gt;</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="h-60 bg-page rounded-lg flex items-center justify-center">
                <TaisiMark size={120} />
              </div>
              <span className="t-small">
                Mark only · &lt;TaisiMark /&gt; ·{" "}
                <a href="/brand/taisi-mark.svg" download className="link">SVG</a>{" "}
                <a href="/brand/taisi-mark.png" download className="link">PNG</a>
              </span>
            </div>
          </div>
          <LogoAnimations />
        </Block>

        <Block title="Colour">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {colours.map((c) => (
              <div key={c.token} className="flex flex-col gap-1.5">
                <div
                  className="h-28 rounded-lg mb-1.5 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-ink)_12%,transparent)]"
                  style={{ background: `var(--color-${c.token})` }}
                />
                <span className="text-[15px] font-medium">{c.name}</span>
                <span className="text-[13px] text-mute">{c.use}</span>
                <code className="text-[12px] text-mute">
                  {c.token} · {c.hex}
                </code>
              </div>
            ))}
          </div>
          <Sub title="The mark’s eleven bands · band-1 to band-11">
            <div className="flex h-16 rounded-lg overflow-hidden">
              {bands.map((b) => (
                <div key={b} className="flex-1" style={{ background: b }} />
              ))}
            </div>
            <p className="t-small">Gold only ever sits on aubergine. On white it is too light to read, so it is never used for text on a light ground.</p>
          </Sub>
        </Block>

        <Block title="Type">
          <p className="t-body">Jost for display type and the wordmark, Geist for everything else.</p>
          <div className="flex flex-col">
            {type.map((t) => (
              <div
                key={t.label}
                className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-2 md:gap-6 items-baseline py-5 border-t border-ink/10 last:border-b"
              >
                <span className="text-[13px] text-mute">{t.spec}</span>
                <span className={t.cls}>{t.sample}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Space and shape">
          <div className="flex flex-wrap items-end gap-5">
            {spacing.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className="bg-ink" style={{ width: s, height: s }} />
                <span className="text-[12px] text-mute">{s}</span>
              </div>
            ))}
            <div className="w-px h-24 bg-ink/10 mx-5" />
            {[
              ["rounded-[4px]", "4 · tags", "w-24 h-24"],
              ["rounded-[6px]", "6 · fields", "w-24 h-24"],
              ["rounded-lg", "8 · cards", "w-24 h-24"],
              ["rounded-full", "pill · buttons", "w-24 h-12"],
            ].map(([r, label, size]) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`${size} bg-page border border-ink ${r}`} />
                <span className="text-[12px] text-mute">{label}</span>
              </div>
            ))}
          </div>
          <p className="t-small">
            Content sits in a 1200px container (<code>container-site</code>). Sections are divided by a
            hairline (<code>section-rule</code>) and padded 128px on desktop (<code>section-pad</code>).
          </p>
        </Block>

        <Block title="Components">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-12">
            <Sub title="Buttons">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="btn btn-ink">btn-ink</span>
                <span className="btn btn-ink-solid">btn-ink-solid</span>
                <span className="btn btn-ink btn-sm">btn-sm</span>
                <span className="btn-text">btn-text</span>
              </div>
              <div className="on-dark bg-ink rounded-lg p-5 flex flex-wrap gap-3 items-center text-cream">
                <span className="btn btn-gold">btn-gold</span>
                <span className="btn btn-cream">btn-cream</span>
                <span className="btn-text">btn-text</span>
              </div>
            </Sub>
            <Sub title="Fields · form-input">
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium">Email</span>
                <input className="form-input" placeholder="you@mail.utoronto.ca" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium">Email</span>
                <input className="form-input" aria-invalid="true" defaultValue="joseph@taisi" />
                <span className="text-[13px] text-rose">Invalid email</span>
              </label>
              <input className="form-input field-pill" placeholder="field-pill" />
            </Sub>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-12">
            <Sub title="Tags and notices">
              <div className="flex flex-wrap gap-2">
                <span className="tag">Students</span>
                <span className="tag">Professionals</span>
              </div>
              <div className="notice">You&rsquo;re on the list.</div>
              <div className="notice notice-error">Something went wrong. Try again.</div>
            </Sub>
            <Sub title="Links">
              <p className="t-body">
                Body copy with an <a href="#" className="link">inline link</a>, which turns ember on
                hover, and <strong>a bolded line in ink</strong>.
              </p>
            </Sub>
          </div>

          <Sub title="Cards · card">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
              {[
                ["Reading Group", "Read and discuss current AI safety research with other students."],
                ["Retreats", "We send members to AI safety retreats hosted by the groups at Harvard and MIT."],
              ].map(([title, body]) => (
                <article key={title} className="card px-8 pt-7 pb-8 flex flex-col gap-3">
                  <h3 className="t-h3">{title}</h3>
                  <p className="t-body">{body}</p>
                </article>
              ))}
              <figure className="card m-0 px-7 py-6 flex flex-col gap-4">
                <blockquote className="m-0 text-[16px] leading-[1.65] text-mute">
                  &ldquo;A testimonial sits in a card with the quote in grey.&rdquo;
                </blockquote>
                <figcaption className="flex flex-col gap-0.5">
                  <strong className="text-[15px] font-medium">Name</strong>
                  <span className="text-[14px] text-mute">Fellow &rsquo;26</span>
                </figcaption>
              </figure>
            </div>
          </Sub>

          <Sub title="Section · <Section object title>">
            <p className="t-body max-w-[720px]">
              Every page section: a hairline above, 128px of padding, an 88px object pinned to the
              heading&rsquo;s left edge that plays once when the reader scrolls to it, then a{" "}
              <code>t-section</code> heading. Every page but the home page opens with{" "}
              <code>&lt;PageHero title object&gt;</code>, so titles start at one height. The object is the
              section&rsquo;s entrance, so the content itself does not animate in. Use at most one
              object per section and never repeat one on a page.
            </p>
          </Sub>
        </Block>

        <Block title="Objects">
          <p className="t-body max-w-[720px]">
            The approved objects from the object bank. Each is a small 3D scene drawn as flat SVG in
            the mark&rsquo;s bands. <code>play=&quot;view&quot;</code> plays once per visit, when the reader
            scrolls to it (section icons), <code>&quot;loop&quot;</code> plays back and forth while on screen
            (heroes), <code>&quot;mount&quot;</code> plays on load (form pages). Under reduced motion
            every object rests in its final pose. Every object is scaled to finish at the same visual
            size, and its outlines keep one thin weight on screen: 1px on icons, up to 2px on heroes.
          </p>
          <ObjectBank />
        </Block>

        <Block title="Motion">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
            {motion.map((m) => (
              <div key={m.name} className="bg-page rounded-lg p-6 flex flex-col gap-1.5">
                <span className="text-[15px] font-medium">{m.name}</span>
                <code className="text-[13px] text-mute">{m.curve}</code>
                <span className="text-[13px] text-mute">{m.use}</span>
              </div>
            ))}
          </div>
          <p className="t-small max-w-[720px]">
            Entrances are quiet: a short lift and a fade, and one entrance carries a whole block. Every
            animation, objects included, is switched off under <code>prefers-reduced-motion</code>.
          </p>
        </Block>
      </div>
    </main>
  );
}
