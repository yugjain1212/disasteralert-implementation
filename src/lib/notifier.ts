import { db } from "@/db";
import { alert_subscriptions } from "@/db/schema";
import { and, sql } from "drizzle-orm";

// Haversine distance in km between two lat/lng points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Minimal email/SMS providers using environment variables
async function sendEmail(to: string, subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const from = process.env.ALERTS_EMAIL_FROM || "alerts@example.com";

  if (resendKey) {
    // Resend API
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    }).catch(() => {});
    return;
  }
  if (sendgridKey) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    }).catch(() => {});
    return;
  }
  // No provider configured
  console.warn("No email provider configured; skipping email to", to);
}

async function sendSMS(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("No SMS provider configured; skipping SMS to", to);
    return;
  }
  const creds = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${creds}` },
    body: params,
  }).catch(() => {});
}

export type NewDisasterEvent = {
  id: number;
  type: string;
  title: string;
  location: string;
  severity: string;
  magnitude?: number | null;
  description?: string | null;
  lat: number;
  lng: number;
  timestamp: number;
};

export async function sendAlertsForEvent(event: NewDisasterEvent) {
  try {
    // Only high-risk alerts escalate (moderate/severe) — customize as needed
    const highRisk = ["moderate", "severe"].includes(event.severity.toLowerCase());
    if (!highRisk) return;

    // Pre-filter by same category in SQL where possible
    const subs = await db
      .select()
      .from(alert_subscriptions)
      .where(sql`${alert_subscriptions.categories} LIKE '%' || ${event.type} || '%'`);

    // Filter by distance and limit to 100 recipients
    const nearby = subs
      .map((s) => ({
        sub: s,
        dist: haversineKm(event.lat, event.lng, s.lat as number, s.lng as number),
      }))
      .filter((x) => x.dist <= (x.sub.radiusKm as number))
      .slice(0, 100);

    if (nearby.length === 0) return;

    const subject = `High-risk ${event.type} near ${event.location}`;
    const html = `
      <h2>${subject}</h2>
      <p>${event.title}</p>
      <p>Severity: <strong>${event.severity}</strong>${event.magnitude ? ` • Magnitude: ${event.magnitude}` : ""}</p>
      <p>Location: ${event.location} • Time: ${new Date(event.timestamp).toLocaleString()}</p>
      <p>${event.description || "Stay safe and follow local guidelines."}</p>
    `;
    const sms = `${subject}: ${event.title}. ${event.description || "Stay safe."}`.slice(0, 140);

    await Promise.all(
      nearby.map(async ({ sub }) => {
        const channels = String(sub.channels).split(",").map((c) => c.trim());
        if (channels.includes("email")) {
          const to = (sub.email as string) || ""; // backend will fall back to user email if extended later
          if (to) await sendEmail(to, subject, html);
        }
        if (channels.includes("sms")) {
          const to = (sub.phone as string) || "";
          if (to) await sendSMS(to, sms);
        }
      })
    );
  } catch (e) {
    console.error("sendAlertsForEvent error", e);
  }
}
