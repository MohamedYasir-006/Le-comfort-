import nodemailer from "nodemailer";
import { SITE } from "./site";

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user, pass },
  });
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  // Resend preferred if configured, else SMTP, else log-only (dev).
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM ?? `Le Comfort <${SITE.email}>`;
    await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
    return { sent: true, via: "resend" };
  }
  const t = transporter();
  if (!t) {
    console.log("[email:dev-log]", opts.subject, "->", opts.to);
    return { sent: false, via: "log" };
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM ?? `Le Comfort <${SITE.email}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return { sent: true, via: "smtp" };
}

export const bookingReceivedEmail = (name: string, room: string, ci: string, co: string, id: string) => `
  <h2>Request received — ${room}</h2>
  <p>Dear ${name},</p>
  <p>We have received your booking request (${id}) for <b>${room}</b>, ${ci} → ${co}.</p>
  <p>Your dates are held provisionally. We will confirm availability and send payment details within ${SITE.confirmWithinHours}.</p>
  <p><b>No online payment is taken.</b> Payment is collected offline (cash / UPI on arrival or via a manual link our team sends separately).</p>
  <p>Questions? Call <a href="${SITE.phoneHref}">${SITE.phone}</a> or reply to this email.</p>
`;

export const bookingConfirmedEmail = (name: string, room: string, ci: string, co: string) => `
  <h2>Booking confirmed — ${room}</h2>
  <p>Dear ${name}, your stay is confirmed: <b>${room}</b>, ${ci} → ${co}.</p>
  <p>Check-in ${SITE.checkInTime} · Check-out ${SITE.checkOutTime}. Address: ${SITE.address}.</p>
  <p>Free on-site parking is available. <a href="${SITE.mapsUrl}">Get directions</a>.</p>
  <p>Contact: <a href="${SITE.phoneHref}">${SITE.phone}</a> · <a href="${SITE.emailHref}">${SITE.email}</a></p>
`;

export async function sendSms(to: string, message: string) {
  // SMS is stubbed behind an env flag — email is mandatory, SMS optional.
  if (!process.env.SMS_API_KEY) {
    console.log("[sms:dev-log] to", to, message);
    return { sent: false, via: "log" };
  }
  console.log("[sms] would send to", to);
  return { sent: true, via: "stub" };
}
