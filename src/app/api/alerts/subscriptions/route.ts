import { NextResponse } from 'next/server';
import { db } from '@/db';
import { alert_subscriptions, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const rows = await db.select().from(alert_subscriptions).where(eq(alert_subscriptions.userId, u.id)).limit(1);
  return NextResponse.json(rows[0] || null);
}

export async function POST(request: Request) {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const body = await request.json();
  const { lat, lng, radiusKm, categories, channels, email, phone } = body;
  if (
    lat === undefined || lng === undefined || radiusKm === undefined ||
    !categories || !channels
  ) {
    return NextResponse.json({ error: 'lat, lng, radiusKm, categories, channels required' }, { status: 400 });
  }

  // Upsert by userId
  const existing = await db.select().from(alert_subscriptions).where(eq(alert_subscriptions.userId, u.id)).limit(1);
  const now = new Date();
  if (existing[0]) {
    await db.update(alert_subscriptions).set({ lat, lng, radiusKm, categories, channels, email, phone, updatedAt: now }).where(eq(alert_subscriptions.id, existing[0].id as number));
  } else {
    await db.insert(alert_subscriptions).values({ userId: u.id, lat, lng, radiusKm, categories, channels, email, phone, createdAt: now, updatedAt: now });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  await db.delete(alert_subscriptions).where(eq(alert_subscriptions.userId, u.id));
  return NextResponse.json({ ok: true });
}
