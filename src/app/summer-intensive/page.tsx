import Round1ApplicationForm from "@/components/Round1ApplicationForm";

export default function SummerIntensive() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="hero-title text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[0.98] tracking-normal mb-4 sm:mb-6 font-semibold">
          <span className="text-accent">Summer Intensive</span>
        </h1>

        <div className="text-[17px] sm:text-[19px] leading-[1.7] text-text mb-8 space-y-4">
          <p className="font-semibold">
            Applications are open for our{" "}
            <span className="text-accent">working professionals cohort this August</span>.
          </p>

          <hr className="border-t border-gray-200 !my-8" />

          <p>
            Mornings are discussions on threat models, mechanistic interpretability, RLHF, scalable oversight, and more. Afternoons are technical sessions where you learn critical AI Safety research skills. Compute and API credits covered.
          </p>
          <ul className="space-y-2 pl-0 list-none">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>One day/week (Sat or Sun), <strong>built to fit around a full-time job</strong></span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Held in person at Trajectory Labs, an off-campus AI safety lab in downtown Toronto near King Station</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Free lunch with AI safety researchers</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Leave with finished projects for your portfolio</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">&#8594;</span>
              <span>Top participants get research opportunities after</span>
            </li>
          </ul>
          <p>
            The working professionals cohort runs in person in Toronto this August. No prior ML or AI safety experience required.
          </p>
        </div>

        <hr className="border-t border-gray-200 !my-8 max-w-[560px] mx-0" />

        <div>
          <h2 className="section-header mb-4">Apply</h2>
          <p className="text-[16px] sm:text-[17px] leading-[1.7] text-text-secondary mb-6 max-w-[560px]">
            This is Round 1 of the application. Fill out the form below and we&rsquo;ll follow up with next steps.
          </p>
          <Round1ApplicationForm />
        </div>
      </section>
    </main>
  );
}
