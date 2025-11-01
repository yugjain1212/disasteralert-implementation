import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Session validation helper (cookie-based)
export async function getCurrentUser(_request?: Request) {
  try {
    // Pass the cookies helper directly so it's evaluated in the correct context
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: (data.user.user_metadata as any)?.name || data.user.email,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}