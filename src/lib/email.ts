import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Julian from TAISI <julian@taisi.ca>";
const APPLY_URL = "https://taisi.ca/summer-intensive";

export async function sendWelcomeEmail(email: string) {
  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "Apply to TAISI's Summer Intensive (closes April 5)",
      html: `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <p style="margin: 0 0 16px;">We're putting together small cohorts of ambitious students for a 4-day AI safety intensive this summer. No prior ML or AI safety experience required. You'll work through technical material, build something for your GitHub, eat free lunch with AI safety researchers, and walk away with valuable research skills.</p>
  <p style="margin: 0 0 24px;">The application takes about 4 minutes. Deadline is April 5th.</p>
  <a href="${APPLY_URL}" style="display: inline-block; background: #D94F30; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 16px;">Apply now</a>
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
