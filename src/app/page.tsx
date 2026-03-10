import Link from "next/link";

function Hero() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-8 md:pb-10">
      <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
        We&rsquo;re a student group at the University of Toronto focused on
        mitigating{" "}
        <span className="text-accent">catastrophic risks from advanced AI</span>
        .
      </h1>

      <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary">
        <p className="text-text">
          We are part of a network of university AI safety groups alongside
          MIT, Harvard, and Cambridge, funded by Kairos. We run introductory fellowships and a summer intensive for ambitious undergraduates, with 50+ fellows across 8 cohorts to date.
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/summer-intensive"
          className="inline-flex items-center px-5 sm:px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
        >
          Apply to Summer Intensive &rarr;
        </Link>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "Before TAISI's fellowship, I had no idea what AI safety was. Now I want to dedicate my career to it. The people were awesome, and it gave me a ton of context about the field.",
    name: "Divy Lastname",
    role: "Fellow '25",
  },
  {
    quote:
      "Placeholder testimonial — replace with a real quote from a fellow or participant.",
    name: "First Last",
    role: "Fellow '25",
  },
  {
    quote:
      "Placeholder testimonial — replace with a real quote from a fellow or participant.",
    name: "First Last",
    role: "Fellow '25",
  },
];

function Testimonials() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      <h2 className="text-[1.1rem] sm:text-[1.25rem] font-semibold tracking-tight mb-8 sm:mb-10">
        From our fellows
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {testimonials.map((t, i) => (
          <blockquote key={i} className="border-l border-accent pl-5">
            <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary mb-4">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 shrink-0" />
              <div>
                <span className="block text-[15px] font-semibold text-text">
                  {t.name}
                </span>
                <span className="block text-[13px] text-text-secondary">
                  {t.role}
                </span>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function StayConnected() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      <h2 className="text-[1.1rem] sm:text-[1.25rem] font-semibold tracking-tight mb-4">
        Stay connected
      </h2>
      <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary mb-6">
        Join our community to hear about upcoming programs, events, and opportunities in AI safety.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a
          href="https://airtable.com/app4Q5tCYanb6H22G/shrIdIZDclGqNuFYs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-text text-text text-[15px] font-semibold hover:bg-text hover:text-white transition-colors"
        >
          Join our mailing list &rarr;
        </a>
        <a
          href="https://discord.com/invite/tuG88vBxS2"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-text text-text text-[15px] font-semibold hover:bg-text hover:text-white transition-colors"
        >
          Join our Discord &rarr;
        </a>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="md:overflow-hidden">
      <Hero />
      {/* <Testimonials /> */}
      <StayConnected />
    </main>
  );
}
