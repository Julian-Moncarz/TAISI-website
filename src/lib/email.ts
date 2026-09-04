import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Julian from TAISI <julian@taisi.ca>";
export async function sendWelcomeEmail(email: string) {
  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to TAISI",
      html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">You're on the TAISI mailing list. We'll keep you posted on upcoming programs, events, and opportunities in AI safety.</p>
  <p style="margin: 0 0 16px;">In the meantime, you can learn more about us at <a href="https://taisi.ca" style="color: #D94F30; text-decoration: none;">taisi.ca</a>.</p>
  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">Julian Moncarz<br/>TAISI</p>
</div>`,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

export async function sendSeptemberFellowshipConfirmation({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  try {
    const greeting = name ? `Hi ${escapeHtml(firstName(name))},` : "Hi,";

    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "Your September fellowship spot is saved",
      html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">${greeting}</p>
  <p style="margin: 0 0 16px;">Thanks for confirming. We've saved your guaranteed spot in the September fellowship.</p>
  <p style="margin: 0 0 16px;">We'll send more details closer to September.</p>
  <p style="margin: 0 0 16px;">If anything changes, reply to this email and let us know.</p>
  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">TAISI team</p>
</div>`,
    });
  } catch (err) {
    console.error("Failed to send September fellowship confirmation:", err);
  }
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
