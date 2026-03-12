export default function Fellowships() {
  return (
    <main>
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 sm:pt-10 md:pt-14 pb-8 md:pb-12">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
          <span className="text-accent">Fellowships</span>
        </h1>

        <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary">
          <p className="text-text">
            We offer two parallel introductory fellowships in AI safety:{" "}
            alignment and governance.
          </p>
          <p>
            The alignment track introduces the technical challenge of making AI
            systems reliably follow human intentions, while the governance track
            examines the role of policy, institutions, and global coordination to
            reduce AI risks.
          </p>
          <p>
            Fellowships run weekly over dinner for 8 sessions in the form of
            paper discussions.
          </p>
          <p className="text-text font-semibold">
            Applications are currently closed, and will reopen mid-March.
          </p>
          <p className="text-[17px] sm:text-[19px]">
            Curriculum developed by BlueDot Impact, adapted by TAISI.
          </p>
        </div>

        <hr className="mt-8 sm:mt-10 border-t border-gray-200" />

        <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h2 className="text-xl font-semibold text-text mb-1">
              Governance Fellowship
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-4">8 weeks</p>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-3">Topics include:</p>
            <ul className="space-y-1.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
              <li>Forecasting</li>
              <li>Overview of key actors</li>
              <li>Identifying levers for effective policy frameworks</li>
              <li>Governance at frontier labs</li>
              <li>Canada&rsquo;s role in international cooperation</li>
              <li>Contributing to AI governance</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-1">
              Alignment Fellowship
            </h2>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-4">8 weeks</p>
            <p className="text-[17px] sm:text-[19px] text-text-secondary mb-3">Topics include:</p>
            <ul className="space-y-1.5 text-[17px] sm:text-[19px] text-text-secondary list-disc pl-5">
              <li>Intro to deep learning (first session only)</li>
              <li>Reinforcement learning from human feedback</li>
              <li>Scalable oversight</li>
              <li>Mechanistic interpretability</li>
              <li>Technical governance</li>
              <li>Contributing to technical AI safety</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
