import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { disaster_events } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const ALLOWED_TYPES = ['earthquake', 'flood', 'wildfire', 'cyclone', 'tsunami', 'storm'];
const ALLOWED_SEVERITIES = ['low', 'moderate', 'severe'];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const active = searchParams.get('active');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      const disasterId = parseInt(id);
      if (isNaN(disasterId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const disaster = await db.select()
        .from(disaster_events)
        .where(and(
          eq(disaster_events.id, disasterId),
          eq(disaster_events.userId, user.id)
        ))
        .limit(1);

      if (disaster.length === 0) {
        return NextResponse.json({ 
          error: 'Disaster not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(disaster[0]);
    }

    // List with filters
    let conditions = [eq(disaster_events.userId, user.id)];

    // Default to active disasters only
    if (active !== 'false') {
      conditions.push(eq(disaster_events.isActive, 1));
    }

    if (type) {
      if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json({ 
          error: `Type must be one of: ${ALLOWED_TYPES.join(', ')}`,
          code: 'INVALID_TYPE' 
        }, { status: 400 });
      }
      conditions.push(eq(disaster_events.type, type));
    }

    if (severity) {
      if (!ALLOWED_SEVERITIES.includes(severity)) {
        return NextResponse.json({ 
          error: `Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`,
          code: 'INVALID_SEVERITY' 
        }, { status: 400 });
      }
      conditions.push(eq(disaster_events.severity, severity));
    }

    const disasters = await db.select()
      .from(disaster_events)
      .where(and(...conditions))
      .orderBy(desc(disaster_events.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(disasters);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { 
      type, 
      title, 
      location, 
      severity, 
      magnitude, 
      description, 
      lat, 
      lng, 
      timestamp 
    } = body;

    // Validate required fields
    if (!type || !title || !location || !severity || lat === undefined || lng === undefined || !timestamp) {
      return NextResponse.json({ 
        error: 'Required fields: type, title, location, severity, lat, lng, timestamp',
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: `Type must be one of: ${ALLOWED_TYPES.join(', ')}`,
        code: 'INVALID_TYPE' 
      }, { status: 400 });
    }

    // Validate severity
    if (!ALLOWED_SEVERITIES.includes(severity)) {
      return NextResponse.json({ 
        error: `Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`,
        code: 'INVALID_SEVERITY' 
      }, { status: 400 });
    }

    // Validate latitude
    const latitude = parseFloat(lat);
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json({ 
        error: 'Latitude must be between -90 and 90',
        code: 'INVALID_LATITUDE' 
      }, { status: 400 });
    }

    // Validate longitude
    const longitude = parseFloat(lng);
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json({ 
        error: 'Longitude must be between -180 and 180',
        code: 'INVALID_LONGITUDE' 
      }, { status: 400 });
    }

    // Validate title and location are strings
    if (typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title must be a non-empty string',
        code: 'INVALID_TITLE' 
      }, { status: 400 });
    }

    if (typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json({ 
        error: 'Location must be a non-empty string',
        code: 'INVALID_LOCATION' 
      }, { status: 400 });
    }

    const now = new Date();
    const newDisaster = await db.insert(disaster_events)
      .values({
        type: type.trim(),
        title: title.trim(),
        location: location.trim(),
        severity: severity.trim(),
        magnitude: magnitude ? parseFloat(magnitude) : null,
        description: description ? description.trim() : null,
        lat: latitude,
        lng: longitude,
        timestamp: parseInt(timestamp),
        userId: user.id,
        createdAt: now,
        updatedAt: now,
        isActive: 1
      })
      .returning();

    return NextResponse.json(newDisaster[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const disasterId = parseInt(id);
    const body = await request.json();

    // Security check: reject if userId provided
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Check if disaster exists and belongs to user
    const existing = await db.select()
      .from(disaster_events)
      .where(and(
        eq(disaster_events.id, disasterId),
        eq(disaster_events.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Disaster not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const { 
      type, 
      title, 
      location, 
      severity, 
      magnitude, 
      description, 
      lat, 
      lng, 
      timestamp,
      isActive 
    } = body;

    const updates: any = {
      updatedAt: new Date()
    };

    // Validate and add type if provided
    if (type !== undefined) {
      if (!ALLOWED_TYPES.includes(type)) {
        return NextResponse.json({ 
          error: `Type must be one of: ${ALLOWED_TYPES.join(', ')}`,
          code: 'INVALID_TYPE' 
        }, { status: 400 });
      }
      updates.type = type.trim();
    }

    // Validate and add severity if provided
    if (severity !== undefined) {
      if (!ALLOWED_SEVERITIES.includes(severity)) {
        return NextResponse.json({ 
          error: `Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`,
          code: 'INVALID_SEVERITY' 
        }, { status: 400 });
      }
      updates.severity = severity.trim();
    }

    // Validate and add latitude if provided
    if (lat !== undefined) {
      const latitude = parseFloat(lat);
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return NextResponse.json({ 
          error: 'Latitude must be between -90 and 90',
          code: 'INVALID_LATITUDE' 
        }, { status: 400 });
      }
      updates.lat = latitude;
    }

    // Validate and add longitude if provided
    if (lng !== undefined) {
      const longitude = parseFloat(lng);
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return NextResponse.json({ 
          error: 'Longitude must be between -180 and 180',
          code: 'INVALID_LONGITUDE' 
        }, { status: 400 });
      }
      updates.lng = longitude;
    }

    // Validate and add title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ 
          error: 'Title must be a non-empty string',
          code: 'INVALID_TITLE' 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    // Validate and add location if provided
    if (location !== undefined) {
      if (typeof location !== 'string' || location.trim() === '') {
        return NextResponse.json({ 
          error: 'Location must be a non-empty string',
          code: 'INVALID_LOCATION' 
        }, { status: 400 });
      }
      updates.location = location.trim();
    }

    // Add optional fields if provided
    if (magnitude !== undefined) {
      updates.magnitude = magnitude ? parseFloat(magnitude) : null;
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (timestamp !== undefined) {
      updates.timestamp = parseInt(timestamp);
    }

    if (isActive !== undefined) {
      updates.isActive = isActive ? 1 : 0;
    }

    const updated = await db.update(disaster_events)
      .set(updates)
      .where(and(
        eq(disaster_events.id, disasterId),
        eq(disaster_events.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Disaster not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const disasterId = parseInt(id);

    // Check if disaster exists and belongs to user
    const existing = await db.select()
      .from(disaster_events)
      .where(and(
        eq(disaster_events.id, disasterId),
        eq(disaster_events.userId, user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Disaster not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(disaster_events)
      .where(and(
        eq(disaster_events.id, disasterId),
        eq(disaster_events.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Disaster not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Disaster deleted successfully',
      disaster: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}