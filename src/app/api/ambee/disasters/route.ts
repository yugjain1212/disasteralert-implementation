import { NextRequest, NextResponse } from 'next/server';

// Proxy Ambee Disasters: latest by continent
// Docs/source provided by user: https://api.ambeedata.com/disasters/latest/by-continent
// Requires GETAMBEE_API_KEY in env. We forward any query params (e.g., continent=Asia)

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GETAMBEE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GETAMBEE_API_KEY is not configured' }, { status: 500 });
    }

    const base = 'https://api.ambeedata.com/disasters/latest/by-continent';
    const url = new URL(base);
    // passthrough all search params
    for (const [k, v] of request.nextUrl.searchParams.entries()) {
      url.searchParams.set(k, v);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: 'Ambee request failed', status: res.status, body: text }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    const message = e?.name === 'AbortError' ? 'Ambee request timed out' : (e?.message || 'Unknown error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
