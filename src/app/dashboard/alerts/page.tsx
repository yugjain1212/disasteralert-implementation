"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface DisasterEvent {
  id: number;
  type: string;
  location: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

export default function AlertsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

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
          throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();
        setDisasters(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load alerts");
        toast.error("Failed to load alerts");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDisasters();
    }
  }, [session]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "medium":
        return <Info className="w-5 h-5 text-info" />;
      case "low":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "border-l-destructive bg-destructive/5";
      case "high":
        return "border-l-warning bg-warning/5";
      case "medium":
        return "border-l-info bg-info/5";
      case "low":
        return "border-l-success bg-success/5";
      default:
        return "border-l-muted bg-muted/5";
    }
  };

  const filteredDisasters =
    filter === "all"
      ? disasters
      : disasters.filter(
          (d) => d.severity.toLowerCase() === filter.toLowerCase()
        );

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
        <h1 className="text-3xl font-bold mb-2">Disaster Alerts</h1>
        <p className="text-muted-foreground">
          Real-time notifications and warnings for disaster events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "critical", "high", "medium", "low"].map((severityFilter) => (
          <button
            key={severityFilter}
            onClick={() => setFilter(severityFilter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === severityFilter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {severityFilter.charAt(0).toUpperCase() + severityFilter.slice(1)}
            {severityFilter === "all" && ` (${disasters.length})`}
            {severityFilter !== "all" &&
              ` (${
                disasters.filter(
                  (d) => d.severity.toLowerCase() === severityFilter
                ).length
              })`}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive font-medium">Error loading alerts</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!error && filteredDisasters.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No alerts found</h3>
          <p className="text-muted-foreground">
            {filter === "all"
              ? "No disaster alerts at this time"
              : `No ${filter} severity alerts`}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredDisasters.map((disaster) => (
          <div
            key={disaster.id}
            className={`border-l-4 rounded-lg p-4 ${getSeverityColor(
              disaster.severity
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(disaster.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {disaster.type.toUpperCase()}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        disaster.severity.toLowerCase() === "critical"
                          ? "bg-destructive text-destructive-foreground"
                          : disaster.severity.toLowerCase() === "high"
                          ? "bg-warning text-warning-foreground"
                          : disaster.severity.toLowerCase() === "medium"
                          ? "bg-info text-info-foreground"
                          : "bg-success text-success-foreground"
                      }`}
                    >
                      {disaster.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        disaster.status === "active"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {disaster.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {disaster.location}
                  </p>
                  <p className="text-sm">{disaster.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(disaster.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
