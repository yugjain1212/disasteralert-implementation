"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Activity, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DisasterEvent {
  id: number;
  type: string;
  location: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
}

export default function ActivityPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/disasters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch activity");
        }

        const data = await response.json();
        // Sort by most recent first
        const sortedData = data.sort(
          (a: DisasterEvent, b: DisasterEvent) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setDisasters(sortedData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load activity"
        );
        toast.error("Failed to load activity");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDisasters();
    }
  }, [session]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type.toLowerCase()) {
      case "earthquake":
        return <Activity className={iconClass} />;
      case "flood":
        return <Activity className={iconClass} />;
      case "wildfire":
        return <Activity className={iconClass} />;
      case "cyclone":
        return <Activity className={iconClass} />;
      case "tsunami":
        return <Activity className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-destructive text-destructive-foreground";
      case "monitoring":
        return "bg-warning text-warning-foreground";
      case "resolved":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Timeline</h1>
        <p className="text-muted-foreground">
          Complete history of disaster events and system activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{disasters.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {disasters.filter((d) => d.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last 24h</p>
              <p className="text-2xl font-bold">
                {
                  disasters.filter(
                    (d) =>
                      new Date().getTime() - new Date(d.created_at).getTime() <
                      86400000
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-medium">Error loading activity</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!error && disasters.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">
            Activity timeline will appear here once events are tracked
          </p>
        </div>
      )}

      {!error && disasters.length > 0 && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {disasters.map((disaster, index) => (
              <div key={disaster.id} className="relative pl-14">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-3.5 top-2 w-5 h-5 rounded-full border-2 border-background ${
                    disaster.status === "active"
                      ? "bg-destructive"
                      : disaster.status === "monitoring"
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                ></div>

                {/* Activity Card */}
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(disaster.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {disaster.type.toUpperCase()} Detected
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                              disaster.status
                            )}`}
                          >
                            {disaster.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{disaster.location}</span>
                        </div>
                        <p className="text-sm mb-2">{disaster.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(disaster.created_at)}</span>
                          </div>
                          <span>Severity: {disaster.severity}</span>
                          <span>
                            Coordinates: {disaster.latitude.toFixed(4)},{" "}
                            {disaster.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
