import { NextRequest, NextResponse } from 'next/server';
import { type HabitsStore } from '@/lib/types';

const REDIS_URL = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

async function redisGet(key: string): Promise<string | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: string | null };
    return data.result;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, value, 'EX', String(ONE_YEAR_SECONDS)]),
  });
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code || !REDIS_URL || !REDIS_TOKEN) {
    return NextResponse.json({ habits: [] });
  }
  try {
    const raw = await redisGet(`habits:${code}`);
    if (!raw) return NextResponse.json({ habits: [] });
    const store = JSON.parse(raw) as HabitsStore;
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ habits: [] });
  }
}

export async function PUT(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code || !REDIS_URL || !REDIS_TOKEN) {
    return NextResponse.json({ ok: false, reason: 'not configured' });
  }
  try {
    const body = (await req.json()) as HabitsStore;
    await redisSet(`habits:${code}`, JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
