// Posters and QR codes point at the site with a ?loc= value on the URL. The
// value travels through to the Email List table so a batch of signups can be
// traced back to the wall or the table it came from.
export function signupSource(location: string | null): string {
  return location || "website";
}

export async function subscribeEmail(email: string, source: string) {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });
  if (!res.ok) throw new Error("Signup failed");
}
