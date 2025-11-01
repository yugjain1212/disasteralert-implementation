"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  MapPin,
  Loader2,
  Filter,
  Activity,
  Flame,
  CloudRain,
  CloudLightning,
  Waves,
  AlertTriangle,
  ArrowLeft,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/dashboard/sidebar";
import { toast } from "sonner";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

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

// Define map container style
const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

// Default center position (can be adjusted)
const defaultCenter = {
  lat: 20,
  lng: 0
};

// Define Getabee API interface
interface GetabeeEarthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    title: string;
    alert: string | null;
    tsunami: number;
  };
  geometry: {
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
}

export default function MapPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const router = useRouter();
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [earthquakes, setEarthquakes] = useState<GetabeeEarthquake[]>([]);
  const [ambee, setAmbee] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<GetabeeEarthquake | DisasterEvent | null>(null);
  const [selectedAmbee, setSelectedAmbee] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(2);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // You can add libraries here if needed
    // libraries: ['places']
  });
  
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Supabase session check
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

  // Fetch disasters from API
  useEffect(() => {
    const fetchDisasters = async () => {
      if (!sessionUser) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/disasters?active=false");

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("You are not authorized to view data yet.");
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

    if (sessionUser) {
      fetchDisasters();
    }
  }, [sessionUser, router]);
  
  // Fetch earthquake data from Getabee API
  useEffect(() => {
    const fetchEarthquakeData = async () => {
      if (!sessionUser) return;
      
      try {
        // Use our API endpoint that fetches from Getabee (currently using USGS as placeholder)
        const response = await fetch('/api/earthquakes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch earthquake data');
        }
        
        const data = await response.json();
        setEarthquakes(data);
      } catch (err) {
        console.error('Error fetching earthquake data:', err);
        toast.error('Failed to load earthquake data');
      }
    };
    
    if (sessionUser) {
      fetchEarthquakeData();
    }
  }, [sessionUser]);

  // Fetch Ambee disasters by continent and merge
  useEffect(() => {
    const loadAmbee = async () => {
      try {
        const continents = ['Asia','Europe','Africa','North America','South America','Oceania'];
        const results = await Promise.all(
          continents.map(async (c) => {
            const r = await fetch(`/api/ambee/disasters?continent=${encodeURIComponent(c)}`);
            if (!r.ok) return null;
            const data = await r.json();
            // Try common shapes: data.data or data.disasters or data.items
            const items = data?.data || data?.disasters || data?.items || [];
            return Array.isArray(items) ? items : [];
          })
        );
        const merged = results.flat().filter(Boolean);
        setAmbee(merged);
      } catch (e) {
        console.error('Ambee load error', e);
      }
    };
    loadAmbee();
  }, []);

  // Fit map bounds to markers when data loads
  useEffect(() => {
    if (!mapRef.current) return;
    const hasQuakes = earthquakes && earthquakes.length > 0;
    const hasEvents = events && events.length > 0;
    const hasAmbee = ambee && ambee.length > 0;
    if (!hasQuakes && !hasEvents && !hasAmbee) return;

    const bounds = new google.maps.LatLngBounds();
    if (hasQuakes) {
      earthquakes.forEach((q) => {
        const lat = q.geometry.coordinates[1];
        const lng = q.geometry.coordinates[0];
        if (isFinite(lat) && isFinite(lng)) bounds.extend({ lat, lng });
      });
    }
    if (hasEvents) {
      events.forEach((e) => {
        if (isFinite(e.lat) && isFinite(e.lng)) bounds.extend({ lat: e.lat, lng: e.lng });
      });
    }
    if (hasAmbee) {
      ambee.forEach((it: any) => {
        const lat = it.latitude ?? it.lat ?? it.geo?.lat ?? it.location?.lat;
        const lng = it.longitude ?? it.lon ?? it.lng ?? it.geo?.lng ?? it.location?.lng;
        if (isFinite(lat) && isFinite(lng)) bounds.extend({ lat, lng });
      });
    }

    try {
      mapRef.current.fitBounds(bounds, 40);
      // If only one point, set a reasonable zoom
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      if (ne.equals(sw)) {
        mapRef.current.setCenter(ne);
        mapRef.current.setZoom(6);
      }
    } catch {}
  }, [earthquakes, events, ambee]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!sessionUser) {
    return null;
  }

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "earthquake":
        return <Activity className="h-4 w-4" />;
      case "wildfire":
        return <Flame className="h-4 w-4" />;
      case "flood":
        return <CloudRain className="h-4 w-4" />;
      case "cyclone":
        return <CloudLightning className="h-4 w-4" />;
      case "tsunami":
        return <Waves className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return "bg-red-500";
      case "moderate":
        return "bg-orange-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  const renderMap = () => {
    if (loadError) {
      return <div className="p-4 text-center">Error loading maps</div>;
    }

    if (!isLoaded) {
      return <div className="p-4 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
    }

    // Precompute info window position to avoid complex JSX expressions
    const infoPosition = selectedAmbee
      ? {
          lat: (selectedAmbee as any).latitude ?? (selectedAmbee as any).lat ?? (selectedAmbee as any).geo?.lat ?? (selectedAmbee as any).location?.lat,
          lng: (selectedAmbee as any).longitude ?? (selectedAmbee as any).lon ?? (selectedAmbee as any).lng ?? (selectedAmbee as any).geo?.lng ?? (selectedAmbee as any).location?.lng,
        }
      : selectedMarker
        ? ((selectedMarker as any).lat !== undefined && typeof (selectedMarker as any).lat === 'number'
            ? { lat: (selectedMarker as any).lat, lng: (selectedMarker as any).lng }
            : { lat: (selectedMarker as GetabeeEarthquake).geometry.coordinates[1], lng: (selectedMarker as GetabeeEarthquake).geometry.coordinates[0] })
        : null;

    const infoContent = selectedAmbee ? (
      <>
        <h3 className="font-bold text-sm">{String((selectedAmbee as any).title || (selectedAmbee as any).name || (selectedAmbee as any).disasterType || 'Disaster')}</h3>
        {Boolean((selectedAmbee as any).severity) && (<p className="text-xs mt-1">Severity: {String((selectedAmbee as any).severity)}</p>)}
        {Boolean((selectedAmbee as any).place) && (<p className="text-xs">{String((selectedAmbee as any).place)}</p>)}
        {Boolean((selectedAmbee as any).updatedAt) && (<p className="text-xs mt-1">{new Date((selectedAmbee as any).updatedAt).toLocaleString()}</p>)}
      </>
    ) : ((selectedMarker as any)?.properties ? (
      <>
        <h3 className="font-bold text-sm">{(selectedMarker as GetabeeEarthquake).properties.title}</h3>
        <p className="text-xs mt-1">Magnitude: {(selectedMarker as GetabeeEarthquake).properties.mag}</p>
        <p className="text-xs">{(selectedMarker as GetabeeEarthquake).properties.place}</p>
        <p className="text-xs mt-1">{new Date((selectedMarker as GetabeeEarthquake).properties.time).toLocaleString()}</p>
      </>
    ) : selectedMarker ? (
      <>
        <h3 className="font-bold text-sm">{(selectedMarker as DisasterEvent).type} - {(selectedMarker as DisasterEvent).location}</h3>
        <p className="text-xs mt-1">Severity: {(selectedMarker as DisasterEvent).severity}</p>
        <p className="text-xs">{(selectedMarker as DisasterEvent).description}</p>
      </>
    ) : null);

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
            },
            {
              featureType: "administrative.country",
              elementType: "geometry",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "administrative.country",
              elementType: "geometry.stroke",
              stylers: [{ color: "#a0a4a5" }],
            },
          ],
        }}
      >
        {/* Render disaster events from your API */}
        {events.map((event) => (
          <Marker
            key={`disaster-${event.id}`}
            position={{ lat: event.lat, lng: event.lng }}
            onClick={() => setSelectedMarker(event)}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${
                event.severity === "severe"
                  ? "red"
                  : event.severity === "moderate"
                  ? "orange"
                  : "green"
              }-dot.png`,
            }}
          />
        ))}

        {/* Render earthquake data from USGS */}
        {earthquakes.map((quake) => (
          <Marker
            key={`earthquake-${quake.id}`}
            position={{ 
              lat: quake.geometry.coordinates[1], 
              lng: quake.geometry.coordinates[0] 
            }}
            onClick={() => setSelectedMarker(quake)}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${
                quake.properties.mag >= 6 ? "red" :
                quake.properties.mag >= 4 ? "orange" :
                quake.properties.mag >= 2 ? "yellow" : "green"
              }-dot.png`,
            }}
          />
        ))}

        {/* Render Ambee disasters */}
        {ambee.map((it: any, idx: number) => {
          const lat = it.latitude ?? it.lat ?? it.geo?.lat ?? it.location?.lat;
          const lng = it.longitude ?? it.lon ?? it.lng ?? it.geo?.lng ?? it.location?.lng;
          if (!isFinite(lat) || !isFinite(lng)) return null;
          const type = (it.disasterType ?? it.type ?? it.category ?? 'disaster').toString().toLowerCase();
          const color = type.includes('fire') ? 'red' : type.includes('flood') ? 'blue' : type.includes('cyclone') || type.includes('storm') ? 'purple' : 'pink';
          return (
            <Marker
              key={`ambee-${idx}`}
              position={{ lat, lng }}
              onClick={() => setSelectedAmbee(it)}
              icon={{ url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png` }}
            />
          );
        })}

        {/* Info Window for selected marker */}
        {(selectedMarker || selectedAmbee) && infoPosition && (
          <InfoWindow position={infoPosition} onCloseClick={() => { setSelectedMarker(null); setSelectedAmbee(null); }}>
            <div className="p-2 max-w-xs">{infoContent}</div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Disaster Map</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <div className={`${isCollapsed ? "lg:col-span-0 hidden" : "lg:col-span-1"}`}>
            <Card className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Disaster Events</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {showFilters && (
                  <div className="space-y-2 mb-4">
                    <Button
                      variant={selectedType === null ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType(null)}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedType === "earthquake" ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType("earthquake")}
                    >
                      <Activity className="h-4 w-4 mr-1" /> Earthquake
                    </Button>
                    <Button
                      variant={selectedType === "flood" ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType("flood")}
                    >
                      <CloudRain className="h-4 w-4 mr-1" /> Flood
                    </Button>
                    <Button
                      variant={selectedType === "wildfire" ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType("wildfire")}
                    >
                      <Flame className="h-4 w-4 mr-1" /> Wildfire
                    </Button>
                    <Button
                      variant={selectedType === "cyclone" ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType("cyclone")}
                    >
                      <CloudLightning className="h-4 w-4 mr-1" /> Cyclone
                    </Button>
                    <Button
                      variant={selectedType === "tsunami" ? "default" : "outline"}
                      size="sm"
                      className="mr-2 mb-2"
                      onClick={() => setSelectedType("tsunami")}
                    >
                      <Waves className="h-4 w-4 mr-1" /> Tsunami
                    </Button>
                  </div>
                )}

                <div className="space-y-4 mt-4 max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="text-center p-4 text-destructive">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      <p>{error}</p>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">
                      No disaster events found
                    </div>
                  ) : (
                    events
                      .filter(
                        (event) =>
                          selectedType === null ||
                          event.type.toLowerCase() === selectedType.toLowerCase()
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedMarker(event);
                            setMapCenter({ lat: event.lat, lng: event.lng });
                            setZoom(10);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getDisasterIcon(event.type)}
                              <span className="font-medium">{event.type}</span>
                            </div>
                            <Badge
                              className={`${getSeverityColor(
                                event.severity
                              )} text-white`}
                            >
                              {event.severity}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">{event.location}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div
            className={`${
              isCollapsed ? "lg:col-span-3" : "lg:col-span-2"
            } h-[600px]`}
          >
            <Card className="h-full">
              <div className="p-0 h-full">
                {renderMap()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
