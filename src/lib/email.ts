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

export async function sendApplicationConfirmation(
  email: string,
  name: string
) {
  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "We got your application",
      html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">Hey ${name},</p>
  <p style="margin: 0 0 16px;">We received your application for TAISI's Summer Intensive. We'll review it and get back to you soon.</p>
  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">Julian Moncarz<br/>TAISI</p>
</div>`,
    });
  } catch (err) {
    console.error("Failed to send application confirmation:", err);
  }
}

export async function sendIntensiveAcceptanceConfirmation({
  email,
  name,
  cohort,
  dates,
}: {
  email: string;
  name?: string;
  cohort?: string;
  dates?: string;
}) {
  try {
    const greeting = name ? `Hi ${escapeHtml(firstName(name))},` : "Hi,";
    const cohortLine = cohort
      ? `<p style="margin: 0 0 16px;">You're confirmed for the ${escapeHtml(cohort)} cohort at Trajectory Labs${dates ? `, meeting on ${escapeHtml(dates)}` : ""}.</p>`
      : `<p style="margin: 0 0 16px;">You're confirmed for TAISI's summer intensive.</p>`;

    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "Your TAISI summer intensive spot is confirmed",
      html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">${greeting}</p>
  <p style="margin: 0 0 16px;">Thanks for confirming your spot! We're excited to have you join us.</p>
  ${cohortLine}
  <p style="margin: 0 0 16px;">Please make sure all four sessions are in your calendar. We'll send more details before your cohort begins.</p>
  <p style="margin: 0 0 16px;">If anything changes, reply to this email as soon as you can.</p>
  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">TAISI team</p>
</div>`,
    });
  } catch (err) {
    console.error("Failed to send intensive acceptance confirmation:", err);
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
