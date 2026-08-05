import { NOTIFY_FORM_URL } from "@/lib/links";

export default function SummerIntensive() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-4 sm:mb-6 font-semibold">
          <span className="text-text">Intensive</span>
        </h1>

        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text mb-8 space-y-4">
          <p>
            Mornings are discussions on threat models, mechanistic interpretability, RLHF, scalable oversight, and more. Afternoons are technical sessions where you learn critical AI Safety research skills. Compute and API credits covered.
          </p>
          <ul className="space-y-3 pl-0 list-none max-w-[760px]">
            <li>One day/week (Sat or Sun), <strong>built to fit around a full-time job</strong></li>
            <li>Held in person at Trajectory Labs, an AI safety lab in downtown Toronto</li>
            <li>Free lunch with AI safety researchers</li>
            <li>Leave with finished projects for your portfolio</li>
            <li>Top participants get research opportunities after</li>
          </ul>
          <p>
            The working professionals cohort runs in person in Toronto. No prior ML or AI safety experience required.
          </p>
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
      </section>
    </main>
  );
}
