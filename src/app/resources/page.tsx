import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Resources | Toronto AI Safety Initiative",
};

// Every link here was checked against its official page in November 2026.
// Descriptions are kept free of dates and deadlines so they do not go stale;
// the programs' own pages carry those.

// logo: the organisation's own icon, shown in a small square tile.
// photo: a person's portrait, shown round. Items with neither get their
// initial in a tile, so every row lines up.
type Item = { name: string; href: string; note?: string; logo?: string; photo?: string };

const atUofT: Item[] = [
  { name: "Roger Grosse", photo: "/people/grosse.webp", href: "https://www.cs.toronto.edu/~rgrosse/", note: "Computer Science" },
  { name: "David Duvenaud", photo: "/people/duvenaud.webp", href: "https://www.cs.toronto.edu/~duvenaud/", note: "Computer Science" },
  { name: "Zhijing Jin", photo: "/people/jin.webp", href: "https://zhijing-jin.com/", note: "Computer Science" },
  {
    name: "Mathematics for AI Safety (MAT1510)", logo: "/logos/resources/fields.png",
    href: "https://www2.fields.utoronto.ca/activities/26-27/SGC-safety",
    note: "A graduate course at the Fields Institute.",
  },
  {
    name: "Trajectory Labs", logo: "/logos/resources/trajectory.png",
    href: "https://www.trajectorylabs.org/",
    note: "An off-campus AI safety coworking and events space downtown, where our fellowships meet. It is independent of U of T.",
  },
];

const reading: Item[] = [
  {
    name: "Kurzgesagt: AI Just Crossed the Terrifying Line. Now What?", logo: "/logos/resources/kurzgesagt.png",
    href: "https://www.youtube.com/watch?v=ujkD4SxPKOI",
    note: "An animated explainer of the July 2026 incident in which AI agents in an OpenAI test hacked Hugging Face.",
  },
];

const programs: { group: string; items: Item[] }[] = [
  {
    group: "Research programs",
    items: [
      { name: "MATS", logo: "/logos/mats-icon.png", href: "https://www.matsprogram.org/", note: "Mentored research in alignment, security and governance, full-time for twelve weeks in Berkeley or London, with a stipend, housing and compute." },
      { name: "SPAR", logo: "/logos/resources/spar.png", href: "https://sparai.org/", note: "Part-time remote projects with a mentor in AI safety, policy or biosecurity, lasting about three months and open to undergraduates." },
      { name: "Anthropic Fellows Program", logo: "/logos/resources/anthropic.png", href: "https://alignment.anthropic.com/2025/anthropic-fellows-program-2026/", note: "Four months of paid empirical safety research under Anthropic mentors, with compute funding." },
      { name: "Astra Fellowship", logo: "/logos/constellation.png", href: "https://constellation.org/programs/astra", note: "Fully funded research in Berkeley with senior mentors, lasting five months and aimed at people with technical or domain experience." },
      { name: "Pivotal Research Fellowship", logo: "/logos/pivotal.png", href: "https://www.pivotal-research.org/fellowship", note: "Fifteen weeks of mentored research in AI safety, governance and biodefense in London, with a stipend and housing support." },
      { name: "ERA Fellowship", logo: "/logos/resources/era.png", href: "https://erafellowship.org/fellowship", note: "A ten-week research fellowship in technical AI safety and governance in Cambridge, UK, with a stipend and visa support." },
      { name: "CBAI AI Safety Research Fellowship", logo: "/logos/resources/cbai.png", href: "https://cbai.ai/ais-research-fellowship", note: "Open to students, postdocs and recent graduates with US work authorization, for ten weeks of research in Cambridge, MA." },
      { name: "LASR Labs", logo: "/logos/resources/lasr.png", href: "https://www.lasrlabs.org/", note: "Small teams do technical safety research with a supervisor in London over thirteen weeks. It is for people with ML engineering experience." },
      { name: "AI Safety Camp", logo: "/logos/resources/aisc.png", href: "https://www.aisafety.camp/", note: "Remote, part-time team projects proposed by project leads, over about three months." },
      { name: "MARS", logo: "/logos/resources/mars.png", href: "https://www.caish.org/mars", note: "Part-time mentored team research for students over about four months, starting with an in-person week in the UK." },
      { name: "Iliad", logo: "/logos/iliad.png", href: "https://www.iliad.ac/", note: "A month-long intensive followed by a three-month research fellowship in alignment, in London or the Bay Area." },
      { name: "CHAI Research Internship", logo: "/logos/resources/chai.png", href: "https://humancompatible.ai/jobs", note: "A paid internship of twelve to sixteen weeks at UC Berkeley's Center for Human-Compatible AI, in person or remote." },
      { name: "XLab Summer Research Fellowship", logo: "/logos/resources/xlab.png", href: "https://xrisk.uchicago.edu/fellowship.html", note: "Research on AI safety or nuclear security at the University of Chicago for ten weeks, with a stipend and housing. Requires US work authorization." },
      { name: "CLR Summer Research Fellowship", logo: "/logos/resources/clr.png", href: "https://longtermrisk.org/programs/summer-research-fellowship/", note: "Eight weeks of paid research on reducing risks of large-scale future suffering, with a mentor from the Center on Long-Term Risk." },
      { name: "PIBBSS Fellowship", logo: "/logos/resources/pibbss.png", href: "https://princint.ai/programs/fellowship/", note: "Full-time research for about three months, for people from other fields (mostly at PhD level) who are moving into AI safety." },
      { name: "Generator Residency", logo: "/logos/resources/generator.svg", href: "https://generatorresidency.org/", note: "A twelve-week residency in Berkeley, with a stipend, for people who want to launch AI safety projects." },
    ],
  },
  {
    group: "Engineering bootcamps",
    items: [
      { name: "ARENA", logo: "/logos/resources/arena.png", href: "https://www.arena.education/", note: "Four to five weeks of hands-on ML engineering for alignment in London, with travel, housing and meals covered." },
      { name: "CAMBRIA", logo: "/logos/resources/cbai.png", href: "https://cbai.ai/cambria", note: "A free three-week program in Cambridge, MA, that works through the ARENA curriculum." },
      { name: "ML4Good", href: "https://www.ml4good.org/", note: "Free eight-day residential bootcamps with technical and governance tracks, held in several regions." },
    ],
  },
  {
    group: "Governance and policy",
    items: [
      { name: "GovAI Fellowships", logo: "/logos/govai-icon.jpg", href: "https://www.governance.ai/opportunities", note: "Three months of paid AI governance research in London or Washington, DC, with summer and winter rounds." },
      { name: "IAPS AI Policy Fellowship", logo: "/logos/iaps.png", href: "https://www.iaps.ai/fellowship", note: "A paid fellowship of about three months for people building AI policy careers, held in Washington, DC, in London or remotely." },
      { name: "Horizon Fellowship", logo: "/logos/resources/horizon.png", href: "https://horizonpublicservice.org/programs/become-a-fellow/", note: "Fully funded placements in Washington, DC, including a junior track for recent graduates. Requires US work authorization." },
      { name: "Talos Fellowship", logo: "/logos/resources/talos.png", href: "https://www.talosnetwork.org/talos-fellowship", note: "Part-time training, a summit in Brussels and an optional paid placement in European AI governance." },
      { name: "Tarbell Fellowship", logo: "/logos/tarbell.svg", href: "https://www.tarbellcenter.org/fellowship", note: "A year of training and a paid placement as an AI reporter at a partner newsroom." },
      { name: "Vista Institute for AI Policy", logo: "/logos/resources/vista.png", href: "https://vistainstituteai.org/", note: "Part-time online courses on AI and the law for law and policy students, with a research fellowship for those who finish." },
      { name: "CAIS AI and Society Fellowship", logo: "/logos/cais-icon.png", href: "https://safe.ai/fellowship", note: "Three months in San Francisco for scholars in economics, law, international relations and related fields, including PhD and JD students." },
    ],
  },
  {
    group: "Courses",
    items: [
      { name: "BlueDot Impact", logo: "/logos/bluedot.png", href: "https://bluedot.org/courses", note: "Online cohort courses in AGI strategy, technical AI safety, frontier AI governance and biosecurity, all free." },
      { name: "AI Safety, Ethics and Society", logo: "/logos/cais-icon.png", href: "https://www.aisafetybook.com/virtual-course", note: "The Center for AI Safety's free twelve-week online course, with small-group discussions. No technical background needed." },
      { name: "Introduction to AI Safety", logo: "/logos/cais-icon.png", href: "https://www.coursera.org/learn/intro-to-ai-safety/", note: "A free, self-paced beginner course on Coursera that takes about four hours." },
      { name: "CLR Fundamentals Program", logo: "/logos/resources/clr.png", href: "https://longtermrisk.org/programs/fundamentals-program/", note: "A short online reading program on risks of future suffering, with weekly meetings." },
    ],
  },
  {
    group: "Workshops and hackathons",
    items: [
      { name: "Apart Research Sprints", logo: "/logos/resources/apart.png", href: "https://www.apartresearch.com/sprints", note: "Weekend research hackathons online and at local sites, open to anyone." },
      { name: "Global Challenges Project", logo: "/logos/resources/gcp.svg", href: "https://www.globalchallengesproject.org/", note: "Three-day residential workshops for students at no cost, with travel, housing and meals covered." },
      { name: "Human-aligned AI Summer School", href: "https://humanaligned.ai/", note: "Four days of mostly technical lectures and workshops on alignment in Prague." },
    ],
  },
  {
    group: "Career support",
    items: [
      { name: "80,000 Hours advising", logo: "/logos/80k-icon.png", href: "https://80000hours.org/speak-with-us/", note: "A free call with an advisor about working on AI risk." },
      { name: "Successif", logo: "/logos/resources/successif.png", href: "https://www.successif.org/", note: "Free career advising for experienced professionals moving into AI risk work." },
    ],
  },
];

const forums: Item[] = [
  { name: "LessWrong", logo: "/logos/resources/lesswrong.png", href: "https://www.lesswrong.com/", note: "Where much AI safety writing is first posted and argued over." },
  { name: "AI Alignment Forum", href: "https://www.alignmentforum.org/", note: "A forum for technical alignment research." },
];

const newsletters: Item[] = [
  { name: "Import AI", logo: "/logos/resources/importai.png", href: "https://importai.substack.com/", note: "Jack Clark's weekly roundup of AI research." },
  { name: "AI Safety Newsletter", logo: "/logos/cais-icon.png", href: "https://newsletter.safe.ai/", note: "From the Center for AI Safety." },
  { name: "Transformer", logo: "/logos/resources/transformer.png", href: "https://www.transformernews.ai/", note: "Weekly news on AI policy and safety." },
  { name: "Trajectory Labs events", logo: "/logos/resources/trajectory.png", href: "https://www.trajectorylabs.org/", note: "Talks and events in Toronto, including AI Safety Thursdays." },
];

/** The tile beside each link: a portrait, a logo, or the item's initial. */
function Thumb({ it }: { it: Item }) {
  if (it.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={it.photo} alt="" width={44} height={44} loading="lazy" className="w-11 h-11 rounded-full object-cover bg-cream shrink-0" />
    );
  }
  return (
    <span className="w-11 h-11 rounded-[8px] border border-ink/10 bg-page grid place-items-center overflow-hidden shrink-0">
      {it.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={it.logo} alt="" width={32} height={32} loading="lazy" className="w-8 h-8 object-contain" />
      ) : (
        <span aria-hidden className="font-display text-[20px] text-mute">{it.name[0]}</span>
      )}
    </span>
  );
}

/** A list of links, two across on wide screens, each with its tile and an optional line under it. */
function Links({ items }: { items: Item[] }) {
  return (
    <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-7">
      {items.map((it) => (
        <li key={it.href + it.name} className="flex items-start gap-4">
          <Thumb it={it} />
          <div className="flex flex-col gap-1 min-w-0">
            <a href={it.href} target="_blank" rel="noopener noreferrer" className="link t-h4 w-fit">
              {it.name}
            </a>
            {it.note && <p className="t-body max-w-[520px]">{it.note}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Resources() {
  return (
    <main>
      <PageHero title="Resources" object="telescope">
        <p className="t-body max-w-[560px]">
          Where to learn more about AI safety, at U of T and elsewhere.
        </p>
      </PageHero>

      <Section title="Start here">
        <Links items={reading} />
      </Section>

      <Section title="AI safety at U of T">
        <Links items={atUofT} />
      </Section>

      <Section title="Fellowships and courses">
        <p className="t-body max-w-[720px]">
          <a href="https://www.aisafety.com/training" target="_blank" rel="noopener noreferrer" className="link">
            AISafety.com
          </a>{" "}
          has a more comprehensive list.
        </p>
        <div className="flex flex-col gap-14">
          {programs.map((g) => (
            <div key={g.group} className="flex flex-col gap-6">
              <h3 className="t-label text-mute">{g.group}</h3>
              <Links items={g.items} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Forums">
        <Links items={forums} />
      </Section>

      <Section title="Newsletters and events">
        <Links items={newsletters} />
      </Section>
    </main>
  );
}
