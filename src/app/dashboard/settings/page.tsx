"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Alert subscription state
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [radiusKm, setRadiusKm] = useState<string>("50");
  const [categories, setCategories] = useState<Record<string, boolean>>({
    earthquake: true,
    tsunami: false,
    flood: false,
    wildfire: false,
    cyclone: false,
    storm: false,
  });
  const [channelEmail, setChannelEmail] = useState<boolean>(true);
  const [channelSMS, setChannelSMS] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Supabase session check (cookie-based)
  useEffect(() => {
    let unsub: { subscription?: { unsubscribe: () => void } } = {};
    const init = async () => {
      setIsPending(true);
      const { data } = await supabase.auth.getSession();
      setSessionUser(data.session?.user ?? null);
      setIsPending(false);
      const sub = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSessionUser(newSession?.user ?? null);
      });
      unsub = { subscription: sub.data.subscription } as any;
    };
    init();
    return () => {
      unsub.subscription?.unsubscribe?.();
    };
  }, []);

  // Load existing subscription
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/alerts/subscriptions");
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;
      setLat(String(data.lat ?? ""));
      setLng(String(data.lng ?? ""));
      setRadiusKm(String(data.radiusKm ?? "50"));
      if (data.categories) {
        const parts = String(data.categories).split(",").map((s: string) => s.trim());
        setCategories((prev) => ({
          earthquake: parts.includes("earthquake"),
          tsunami: parts.includes("tsunami"),
          flood: parts.includes("flood"),
          wildfire: parts.includes("wildfire"),
          cyclone: parts.includes("cyclone"),
          storm: parts.includes("storm"),
        }));
      }
      if (data.channels) {
        const ch = String(data.channels).split(",").map((s: string) => s.trim());
        setChannelEmail(ch.includes("email"));
        setChannelSMS(ch.includes("sms"));
      }
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
    };
    if (sessionUser) load();
  }, [sessionUser]);

  const saveSubscription = async () => {
    try {
      setSaving(true);
      const cats = Object.entries(categories)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",");
      const channels = [channelEmail ? "email" : null, channelSMS ? "sms" : null]
        .filter(Boolean)
        .join(",");
      if (!lat || !lng || !radiusKm || !cats || !channels) {
        toast.error("Please fill location, radius, categories, and at least one channel");
        return;
      }
      const res = await fetch("/api/alerts/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radiusKm: parseFloat(radiusKm),
          categories: cats,
          channels,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save subscription");
      toast.success("Alert subscription saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save subscription");
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!sessionUser) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <h1 className="text-3xl font-bold">Settings</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{sessionUser?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="ml-2 break-all">{sessionUser?.id}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable email alerts</span>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark mode</span>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Alert Subscription</h2>
              <p className="text-sm text-muted-foreground mb-4">Get notified by email or SMS when high-risk disasters occur near your location. Set your location, radius, categories and channels.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g., 28.6139" />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g., 77.2090" />
                </div>
                <div>
                  <Label htmlFor="radius">Radius (km)</Label>
                  <Input id="radius" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} placeholder="e.g., 50" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Categories</Label>
                <div className="grid sm:grid-cols-3 gap-3 mt-2">
                  {Object.keys(categories).map((k) => (
                    <label key={k} className="flex items-center gap-2 p-2 rounded border hover:bg-accent cursor-pointer">
                      <input type="checkbox" checked={categories[k]} onChange={(e) => setCategories((prev) => ({ ...prev, [k]: e.target.checked }))} />
                      <span className="capitalize">{k}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Channels</Label>
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} /> Email
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={channelSMS} onChange={(e) => setChannelSMS(e.target.checked)} /> SMS
                    </label>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Leave blank to use account email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (for SMS)</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="E.164 format e.g., +15551234567" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={saveSubscription} disabled={saving}>{saving ? "Saving..." : "Save Subscription"}</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
