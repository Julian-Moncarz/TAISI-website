import { redirect } from "next/navigation";

export default async function PosterLanding({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string }>;
}) {
  const { loc } = await searchParams;
  redirect(loc ? `/?loc=${encodeURIComponent(loc)}` : "/");
}
