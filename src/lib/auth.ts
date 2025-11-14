import { cookies } from 'next/headers';

// Demo-only current user based on cookie. If `demo_auth=1` is present,
// return a mock user. Otherwise return null.
export async function getCurrentUser(_request?: Request) {
  try {
    const store = await cookies();
    const demo = store.get('demo_auth');
    if (demo?.value === '1') {
      return {
        id: 'demo-user',
        email: 'demo@demo.com',
        name: 'Demo User',
      } as const;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}