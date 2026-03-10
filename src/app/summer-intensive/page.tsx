export default function SummerIntensive() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
          Summer <span className="text-accent">Intensive</span>
        </h1>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary">
          <p className="text-text">
            AI progress is accelerating. AI safety is talent-constrained.
          </p>
          <p className="text-text">
            In partnership with Trajectory Labs, we&rsquo;re running 4-day
            summer bootcamps to get more people working on AI safety.
          </p>
          <p>
            The intensive introduces ambitious undergraduates to the hard
            problems of aligning and controlling superintelligent AI systems. No ML background or prior engagement with the field is
            required. We&rsquo;re looking for strong quantitative thinkers
            who care about this problem.
          </p>
        </div>

        <hr className="mt-10 border-t border-gray-200" />

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-text mb-4">
            About the program
          </h2>
          <ul className="space-y-2.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
            <li>A small cohort of exceptional, engaged peers</li>
            <li>Full days of curated readings, discussions, and hands-on technical workshops</li>
            <li>Catered lunch with AI safety researchers at Trajectory Labs</li>
            <li>
              After the intensive, you&rsquo;re in our network: we&rsquo;ll
              keep connecting you with research opportunities and people in the field
            </li>
          </ul>
          <p className="mt-4 text-[17px] sm:text-[19px] text-text-secondary">
            One full day per week on a weekend, for 4 weeks. Cohorts running May through August. Hosted at Trajectory Labs in Toronto.
          </p>
        </div>

        <p className="mt-10 text-text font-semibold text-[17px] sm:text-[19px]">
          Applications are selective and close April 5th, EoD.
        </p>

        <div className="mt-10">
          <iframe
            className="w-full border-0"
            src="https://airtable.com/embed/appVfG77MoQbG3bgi/pagW6YDWqH4GG76kw/form"
            scrolling="no"
            style={{ minHeight: "1500px", background: "transparent", overflow: "hidden" }}
          />
        </div>
      </section>
    </main>
  );
}
