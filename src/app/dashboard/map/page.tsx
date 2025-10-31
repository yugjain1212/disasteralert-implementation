"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { 
  MapPin,
  Loader2,
  Filter,
  Activity,
  Flame,
  CloudRain,
  CloudLightning,
  Waves,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/dashboard/sidebar";
import { toast } from "sonner";

interface DisasterEvent {
  id: number;
  type: 'earthquake' | 'flood' | 'wildfire' | 'cyclone' | 'tsunami' | 'storm';
  title: string;
  location: string;
  severity: 'low' | 'moderate' | 'severe';
  magnitude?: number | null;
  description?: string | null;
  timestamp: number;
  lat: number;
  lng: number;
  userId: string | null;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export default function MapPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch disasters from API
  useEffect(() => {
    const fetchDisasters = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/disasters?active=false", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Session expired. Please login again.");
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch disasters: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching disasters:", err);
        setError(err instanceof Error ? err.message : "Failed to load disasters");
        toast.error("Failed to load disaster data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDisasters();
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const filteredEvents = selectedType
    ? events.filter(e => e.type === selectedType)
    : events;

  const disasterTypes = [
    { type: 'earthquake', label: 'Earthquakes', icon: Activity, count: events.filter(e => e.type === 'earthquake').length },
    { type: 'wildfire', label: 'Wildfires', icon: Flame, count: events.filter(e => e.type === 'wildfire').length },
    { type: 'flood', label: 'Floods', icon: CloudRain, count: events.filter(e => e.type === 'flood').length },
    { type: 'cyclone', label: 'Cyclones', icon: CloudLightning, count: events.filter(e => e.type === 'cyclone').length },
    { type: 'tsunami', label: 'Tsunamis', icon: Waves, count: events.filter(e => e.type === 'tsunami').length },
    { type: 'storm', label: 'Storms', icon: AlertTriangle, count: events.filter(e => e.type === 'storm').length },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Interactive Disaster Map</h1>
            <p className="text-muted-foreground">
              Visualize {events.length} active disasters on an interactive global map
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading disaster data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error Loading Data</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Map Content */}
          {!isLoading && !error && (
            <Card className="overflow-hidden shadow-lg">
              <div className="p-6 border-b border-border bg-card/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">Global Disaster Map</h2>
                    <p className="text-sm text-muted-foreground">
                      Interactive visualization of {filteredEvents.length} disasters
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Live Data
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                  </div>
                </div>

                {/* Filter Types */}
                {showFilters && (
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Filter by Disaster Type</h3>
                      {selectedType && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedType(null)}
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {disasterTypes.map(({ type, label, icon: Icon, count }) => (
                        <Button
                          key={type}
                          variant={selectedType === type ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setSelectedType(selectedType === type ? null : type)}
                          disabled={count === 0}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label} ({count})
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="relative w-full h-[700px] bg-gradient-to-br from-secondary/20 to-secondary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-2xl px-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <MapPin className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Google Maps Integration</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Interactive map will display {filteredEvents.length} real-time disaster markers with:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left">
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-sm"><span className="font-semibold">📍</span> Clustered markers by location</p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-sm"><span className="font-semibold">🗺️</span> Heat map visualization</p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-sm"><span className="font-semibold">🎨</span> Color-coded by severity</p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <p className="text-sm"><span className="font-semibold">ℹ️</span> Interactive info windows</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Ready for Google Maps API integration</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Footer */}
              <div className="p-6 border-t border-border bg-card/50">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                    <p className="text-2xl font-bold">{filteredEvents.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Locations</p>
                    <p className="text-2xl font-bold">{new Set(filteredEvents.map(e => e.location)).size}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Severe Alerts</p>
                    <p className="text-2xl font-bold text-red-500">
                      {filteredEvents.filter(e => e.severity === 'severe').length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
