import Image from "next/image";
import Link from "next/link";
import RotatingText from "@/components/RotatingText";

function Hero() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 md:pt-20 pb-8 md:pb-10">
      <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3.25rem] leading-[1.15] tracking-tight mb-6 sm:mb-8 font-normal">
        We train exceptional students to become AI safety{" "}
        <RotatingText />
      </h1>

      <div className="space-y-4 sm:space-y-5 text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary">
        <p className="text-text">
          AI systems are advancing faster than we can make them safe. Making sure advanced AI goes well for humanity is the defining issue of our time. It&rsquo;s also an exciting, open problem, and it needs more people.
        </p>
        <p className="text-text">
          We are part of a network of university AI safety groups funded by <a href="https://kairos-project.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">Kairos</a>, which also
          funds groups at MIT, Harvard, and Cambridge. We run{" "}
          <Link href="/summer-intensive" className="underline hover:text-accent transition-colors">intensives</Link> during the summer and{" "}
          <Link href="/fellowships" className="underline hover:text-accent transition-colors">fellowships</Link> during the school year.
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/summer-intensive"
          className="inline-flex items-center px-5 sm:px-6 py-3 bg-accent text-white text-[15px] font-semibold hover:bg-accent-hover transition-colors"
        >
          Apply to our Summer Intensive &rarr;
        </Link>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "I came in curious and found a community of people who genuinely care about getting this right, a real grip on the technical landscape, and a clearer sense of where I want to contribute. The modern discussion space and free food are also awesome perks. These fellowships have given me a foundation for thinking about AI safety that I carry into everything I work on.",
    name: "Pera",
    role: "Fellow '25 and '26",
    image: "/pera.webp",
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
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-2 md:pt-4 pb-8 md:pb-10">
      <h2 className="text-[1.35rem] sm:text-[1.5rem] tracking-tight mb-6 sm:mb-8 font-normal text-text">
        What our fellows say:
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
      <p className="text-[17px] sm:text-[19px] leading-[1.7] text-text-secondary mt-8">
        Fellows have gone on to join SPAR, AI Safety Camp, and university labs such as <a href="https://zhijing-jin.com/home/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">Prof. Zhijing Jin&rsquo;s group</a>.
      </p>
    </section>
  );
}


export default function Home() {
  return (
    <main className="md:overflow-hidden">
      <Hero />
      <Testimonials />
    </main>
  );
}
