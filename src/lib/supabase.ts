"use client";

// Demo-only lightweight auth shim to avoid Supabase env requirements.
// Provides a minimal subset used in the app: getSession, onAuthStateChange,
// signInWithPassword, signUp, signOut.

type DemoUser = { id: string; email: string; user_metadata?: { name?: string } };

function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const hasDemo = document.cookie.split(";").some((c) => c.trim().startsWith("demo_auth=1"));
  const userStr = localStorage.getItem("demo_user");
  if (!hasDemo || !userStr) return null;
  try {
    const u = JSON.parse(userStr);
    return { id: "demo-user", email: u.email, user_metadata: { name: u.name } };
  } catch {
    return null;
  }
}

export const supabase = {
  auth: {
    async getSession() {
      const user = getDemoUser();
      return { data: { session: user ? { user } : null } } as any;
    },
    onAuthStateChange(_cb: any) {
      // No real subscription in demo; return unsubscribe stub
      return { data: { subscription: { unsubscribe() {} } } } as any;
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const demoEmail = "demo@demo.com";
      const demoPassword = "demo123";
      if (email === demoEmail && password === demoPassword) {
        const maxAgeDays = 1;
        document.cookie = `demo_auth=1; Path=/; Max-Age=${60 * 60 * 24 * maxAgeDays}`;
        localStorage.setItem("demo_user", JSON.stringify({ name: "Demo User", email: demoEmail }));
        return { data: { user: getDemoUser() }, error: null } as any;
      }
      return { data: { user: null }, error: { message: "Invalid credentials (demo)" } } as any;
    },
    async signUp(_data: any) {
      return { data: { user: null }, error: { message: "Sign up disabled in demo" } } as any;
    },
    async signOut() {
      if (typeof window !== "undefined") {
        document.cookie = "demo_auth=; Path=/; Max-Age=0";
        localStorage.removeItem("demo_user");
      }
      return { error: null } as any;
    },
  },
} as const;