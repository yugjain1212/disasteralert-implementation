import { NextRequest, NextResponse } from 'next/server';
// Public endpoint: no auth required for viewing earthquakes

export async function GET(request: NextRequest) {
  try {
    // Build USGS FDSN query from incoming search params
    const inParams = request.nextUrl.searchParams;
    const usgs = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    const out = usgs.searchParams;
    // Always request GeoJSON
    out.set('format', 'geojson');
    // Passthrough supported filters when provided
    const passthrough = [
      'starttime',
      'endtime',
      'minmagnitude',
      'maxmagnitude',
      'minlatitude',
      'maxlatitude',
      'minlongitude',
      'maxlongitude',
      'latitude',
      'longitude',
      'maxradius',
      'maxradiuskm',
      'minradius',
      'minradiuskm',
      'orderby',
      'limit',
      'offset',
    ];
    for (const key of passthrough) {
      const v = inParams.get(key);
      if (v) out.set(key, v);
    }

    // Sensible defaults if not provided: last 24h, ordered by time desc, limit 500
    if (!out.get('starttime') && !out.get('endtime')) {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      out.set('starttime', start.toISOString());
      out.set('endtime', end.toISOString());
    }
    if (!out.get('orderby')) out.set('orderby', 'time');
    if (!out.get('limit')) out.set('limit', '500');

    // Timeout controller
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(usgs.toString(), { signal: controller.signal });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error('Failed to fetch earthquake data');
    }
    
    const data = await response.json();
    
    return NextResponse.json(data.features);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}