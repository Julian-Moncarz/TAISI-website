import Image from "next/image";
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
          We are part of a network of university AI safety groups funded by Kairos, which also
          funds groups at MIT, Harvard, and Cambridge. We run{" "}
          <Link href="/summer-intensive" className="underline hover:text-accent transition-colors">intensives</Link> during the summer and{" "}
          <Link href="/fellowships" className="underline hover:text-accent transition-colors">fellowships</Link> during the school year, with 50+ participants across 8 cohorts to date.
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
      "This fellowship gave me a structured, interesting set of things to think and learn about each week, but more importantly it gave me an environment where I could talk and connect with people who have compelling ideas and share similar concerns. After completing the program, I am part of a community rich with opportunity and information. I would recommend it to anyone with any interest in the technical aspect of AI systems or AI safety.",
    name: "Paul",
    role: "Fellow '25",
    image: "/paul.webp",
  },
  {
    quote:
      "I participated in a fellowship last fall, and I absolutely loved it! The fellowship gave me a friendly and passionate environment in which to explore recent research in AI alignment techniques during meals with other students. Since the fellowship, I've continued to develop my skills alongside these students, and have become much more informed and capable of working to improve AI safety.",
    name: "Boyan",
    role: "Fellow '25",
    image: "/boyan.png",
    imagePosition: "center 20%",
  },
];

function Testimonials() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      <h2 className="text-[1.1rem] sm:text-[1.25rem] font-semibold tracking-tight mb-8 sm:mb-10">
        From our fellows
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {testimonials.map((t, i) => (
          <blockquote key={i} className="border-l border-accent pl-5">
            <p className="text-[15px] sm:text-[16px] leading-[1.7] text-text-secondary mb-4">
              {t.quote}
            </p>
            <footer className="flex items-center gap-3">
              {t.image ? (
                <Image src={t.image} alt={t.name} width={64} height={64} className="w-16 h-16 object-cover shrink-0" style={t.imagePosition ? { objectPosition: t.imagePosition } : { objectPosition: "top" }} />
              ) : (
                <div className="w-16 h-16 bg-gray-200 shrink-0" />
              )}
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
      <Testimonials />
      <StayConnected />
    </main>
  );
}
