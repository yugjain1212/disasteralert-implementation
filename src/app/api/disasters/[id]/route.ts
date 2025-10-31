import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { disaster_events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_TYPES = ['earthquake', 'flood', 'wildfire', 'cyclone', 'tsunami', 'storm'];
const VALID_SEVERITIES = ['low', 'moderate', 'severe'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const disaster = await db
      .select()
      .from(disaster_events)
      .where(
        and(
          eq(disaster_events.id, parseInt(id)),
          eq(disaster_events.userId, user.id)
        )
      )
      .limit(1);

    if (disaster.length === 0) {
      return NextResponse.json(
        { error: 'Disaster not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(disaster[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if disaster exists and belongs to user
    const existing = await db
      .select()
      .from(disaster_events)
      .where(
        and(
          eq(disaster_events.id, parseInt(id)),
          eq(disaster_events.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Disaster not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return NextResponse.json(
        {
          error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate severity if provided
    if (body.severity && !VALID_SEVERITIES.includes(body.severity)) {
      return NextResponse.json(
        {
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
          code: 'INVALID_SEVERITY',
        },
        { status: 400 }
      );
    }

    // Validate latitude if provided
    if (body.lat !== undefined && (body.lat < -90 || body.lat > 90)) {
      return NextResponse.json(
        {
          error: 'Latitude must be between -90 and 90',
          code: 'INVALID_LATITUDE',
        },
        { status: 400 }
      );
    }

    // Validate longitude if provided
    if (body.lng !== undefined && (body.lng < -180 || body.lng > 180)) {
      return NextResponse.json(
        {
          error: 'Longitude must be between -180 and 180',
          code: 'INVALID_LONGITUDE',
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Math.floor(Date.now() / 1000),
    };

    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.severity !== undefined) updateData.severity = body.severity;
    if (body.magnitude !== undefined) updateData.magnitude = body.magnitude;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;
    if (body.timestamp !== undefined) updateData.timestamp = body.timestamp;
    if (body.isActive !== undefined) updateData.isActive = body.isActive ? 1 : 0;

    const updated = await db
      .update(disaster_events)
      .set(updateData)
      .where(
        and(
          eq(disaster_events.id, parseInt(id)),
          eq(disaster_events.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update disaster', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if disaster exists and belongs to user
    const existing = await db
      .select()
      .from(disaster_events)
      .where(
        and(
          eq(disaster_events.id, parseInt(id)),
          eq(disaster_events.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Disaster not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(disaster_events)
      .where(
        and(
          eq(disaster_events.id, parseInt(id)),
          eq(disaster_events.userId, user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete disaster', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Disaster deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}