import Image from "next/image";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image?: string;
  imagePosition?: string;
};

/** One testimonial: the quote in grey, then a round portrait with name and role. */
export function TestimonialCard({ quote, name, role, image, imagePosition }: Testimonial) {
  return (
    <figure className="card m-0 px-7 py-6 flex flex-col gap-4">
      <blockquote className="m-0 flex-1 t-body hang">
        <span className="hang-mark">&ldquo;</span>
        {quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3.5">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={80}
            height={80}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ objectPosition: imagePosition ?? "top" }}
          />
        ) : (
          <span aria-hidden className="w-10 h-10 rounded-full bg-cream shrink-0" />
        )}
        <span className="flex flex-col gap-0.5">
          <strong className="t-name">{name}</strong>
          <span className="t-role">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Testimonial cards in a responsive grid. */
export default function TestimonialRow({ items }: { items: Testimonial[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5 items-stretch">
      {items.map((t, i) => (
        <TestimonialCard key={`${t.name}-${i}`} {...t} />
      ))}
    </div>
  );
}
