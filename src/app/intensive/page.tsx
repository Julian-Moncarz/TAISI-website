import HeroBackdrop from "@/components/HeroBackdrop";
import { NOTIFY_FORM_URL } from "@/lib/links";

// Dissolves the clipped left edge of the drawing. It reaches full strength
// well before the right of the screen, so the building itself stays solid.
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 14%, rgba(0,0,0,0.26) 26%, rgba(0,0,0,0.50) 38%, rgba(0,0,0,0.74) 50%, rgba(0,0,0,0.92) 62%, #000 74%)";

// Keeps the body copy readable over the drawing. The text column runs to
// roughly two thirds of the screen, so the wash only lets go past that.
const PAGE_WASH =
  "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 28%, rgba(255,255,255,0.975) 38%, rgba(255,255,255,0.92) 47%, rgba(255,255,255,0.83) 56%, rgba(255,255,255,0.71) 66%, rgba(255,255,255,0.56) 78%, rgba(255,255,255,0.40) 90%, rgba(255,255,255,0.30) 100%)";

export default function SummerIntensive() {
  return (
    <main>
      <section className="relative">
        {/* Pinned to the viewport and fading out on scroll, as on the other
            pages. */}
        <HeroBackdrop fadeOverScreens={0.75}>
          {/* Adelaide St drawing, anchored to the right edge of the screen.
              The band is narrower than the drawing, so its left edge is
              clipped. Masking that edge away dissolves the drawing into the
              page instead of leaving a straight cut through the trees. */}
          <div
            aria-hidden
            className="hidden sm:block absolute inset-y-0 right-0 w-[55%] bg-no-repeat"
            style={
              {
                backgroundImage: "url('/hero-intensive.webp')",
                backgroundPosition: "right center",
                backgroundSize: "auto 96%",
                opacity: 0.85,
                transform: "translateY(45px)",
                maskImage: EDGE_MASK,
                WebkitMaskImage: EDGE_MASK,
              } as React.CSSProperties
            }
          />
          {/* Fades the drawing into the page. A two-stop ramp leaves a visible
              kink where the solid white ends, so the falloff is spread over
              many stops that ease out instead. */}
          <div aria-hidden className="absolute inset-0" style={{ background: PAGE_WASH }} />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white"
          />
        </HeroBackdrop>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <div>
          <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-4 sm:mb-6 font-semibold">
            <span className="text-text">Intensive</span>
          </h1>
        </div>

        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text space-y-4 max-w-[820px]">
          <div>
            <p>
              Mornings are discussions on threat models, mechanistic interpretability, RLHF, scalable oversight, and more. Afternoons are technical sessions where you learn critical AI Safety research skills. Compute and API credits covered.
            </p>
          </div>
          <div>
            <p>
              The working professionals cohort runs in person in Toronto. No prior ML or AI safety experience required.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <a
            href={NOTIFY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card-cta"
            style={
              {
                "--cta-fg": "#D94F30",
                "--cta-hover-bg": "#D94F30",
                "--cta-hover-fg": "#FFFFFF",
              } as React.CSSProperties
            }
          >
            Notify me when applications open
            <span aria-hidden className="card-cta-arrow">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                className="shrink-0"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
          </a>
        </div>

        <div>
          <h2 className="section-header mt-9 sm:mt-11 mb-4">Program details</h2>
        </div>

        <div>
          <ul className="text-[17px] sm:text-[19px] leading-[1.7] text-text space-y-3 pl-0 list-none max-w-[820px]">
            <li>One day/week (Sat or Sun), <strong>built to fit around a full-time job</strong></li>
            <li>Held in person at Trajectory Labs, an AI safety lab in downtown Toronto</li>
            <li>Free lunch with AI safety researchers</li>
            <li>Leave with finished projects for your portfolio</li>
            <li>Top participants get research opportunities after</li>
          </ul>
        </div>
        </div>
      </section>
    </main>
  );
}
