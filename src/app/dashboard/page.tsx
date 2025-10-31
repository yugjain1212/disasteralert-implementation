"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { 
  Activity, 
  Flame, 
  CloudRain, 
  CloudLightning, 
  Waves, 
  AlertTriangle,
  Filter,
  MapPin,
  TrendingUp,
  Clock,
  Users,
  Loader2
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

const DisasterIcon = ({ type }: { type: DisasterEvent['type'] }) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'earthquake': return <Activity className={iconClass} />;
    case 'wildfire': return <Flame className={iconClass} />;
    case 'flood': return <CloudRain className={iconClass} />;
    case 'cyclone': return <CloudLightning className={iconClass} />;
    case 'tsunami': return <Waves className={iconClass} />;
    case 'storm': return <AlertTriangle className={iconClass} />;
  }
};

const getSeverityColor = (severity: DisasterEvent['severity']) => {
  switch (severity) {
    case 'severe': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'moderate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
};

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground">
                  Real-time monitoring of natural disasters worldwide
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="px-3 py-1 bg-green-500/10 text-green-500 border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Last updated: Just now
                </Button>
              </div>
            </div>
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

          {/* Main Content - Only show when not loading */}
          {!isLoading && !error && (
            <>
              {/* Stats Row - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="bg-primary/5">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Active Events</p>
                  <p className="text-3xl font-bold">{events.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Across {new Set(events.map(e => e.location)).size} locations
                  </p>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-red-500" />
                    </div>
                    <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20">
                      Critical
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Severe Alerts</p>
                  <p className="text-3xl font-bold text-red-500">
                    {events.filter(e => e.severity === 'severe').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Requires immediate attention
                  </p>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <CloudLightning className="w-6 h-6 text-amber-500" />
                    </div>
                    <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20">
                      Watch
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Moderate Alerts</p>
                  <p className="text-3xl font-bold text-amber-500">
                    {events.filter(e => e.severity === 'moderate').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Monitor conditions
                  </p>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                    <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20">
                      Safe
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Low Priority</p>
                  <p className="text-3xl font-bold text-green-500">
                    {events.filter(e => e.severity === 'low').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Monitoring only
                  </p>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Map Section - Enhanced */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-border bg-card/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold mb-1">Global Disaster Map</h2>
                          <p className="text-sm text-muted-foreground">
                            Interactive visualization of {events.length} active disasters
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          {showFilters ? "Hide" : "Show"} Filters
                        </Button>
                      </div>

                      {/* Filter Types - Enhanced */}
                      {showFilters && (
                        <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">Filter by Disaster Type</h3>
                            {selectedType && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedType(null)}
                              >
                                Clear All
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
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

                    {/* Map Placeholder - Enhanced */}
                    <div className="relative w-full h-[550px] bg-gradient-to-br from-secondary/20 to-secondary/5">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <MapPin className="w-10 h-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">Google Maps Integration</h3>
                          <p className="text-muted-foreground mb-4 max-w-md">
                            Interactive map will display {events.length} real-time disaster markers with clustering and heat map visualization
                          </p>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Ready for API integration</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Live Feed - Enhanced */}
                <div className="lg:col-span-1">
                  <Card className="overflow-hidden shadow-lg h-full">
                    <div className="p-6 border-b border-border bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-semibold">Live Feed</h2>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          {filteredEvents.length} Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Real-time disaster updates
                      </p>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                      {filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground">
                            {selectedType ? "No disasters of this type" : "No active disasters"}
                          </p>
                        </div>
                      ) : (
                        filteredEvents.map((event) => (
                          <div
                            key={event.id}
                            className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card hover:bg-card/80"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                event.severity === 'severe' ? 'bg-red-500/20 group-hover:bg-red-500/30' :
                                event.severity === 'moderate' ? 'bg-amber-500/20 group-hover:bg-amber-500/30' :
                                'bg-green-500/20 group-hover:bg-green-500/30'
                              } transition-colors`}>
                                <DisasterIcon type={event.type} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={getSeverityColor(event.severity)}>
                                    {event.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor((Date.now() - event.timestamp * 1000) / 60000)}m ago
                                  </span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </p>
                                {event.magnitude && (
                                  <div className="mt-2 pt-2 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-semibold">Magnitude:</span> {event.magnitude}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}