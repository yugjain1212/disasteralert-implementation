"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Use the Next.js Auth Helpers client so that auth cookies are automatically managed.
// This allows `middleware.ts` (which uses createMiddlewareClient) to see the session
// and not redirect from /dashboard back to /login.
export const supabase = createClientComponentClient();