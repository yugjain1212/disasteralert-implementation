"use client";

import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Flame,
  CloudRain,
  CloudLightning,
  Waves,
  Menu,
  X,
  AlertTriangle,
  Shield,
  Bell,
  Map,
  Activity,
  Zap,
  User,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Solution {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const DATA_SOLUTIONS: Solution[] = [
  {
    title: "Real-Time Tracking",
    description: "Monitor live disaster events across the globe",
    href: "#",
    icon: Activity,
  },
  {
    title: "Smart Alerts",
    description: "Get notified about events in your saved locations",
    href: "#",
    icon: Bell,
  },
  {
    title: "Safety Guidance",
    description: "AI-powered safety tips and emergency protocols",
    href: "#",
    icon: Shield,
  },
  {
    title: "Interactive Maps",
    description: "Explore detailed disaster zones with Google Maps",
    href: "#",
    icon: Map,
  },
];

interface Platfrom {
  title: string;
  href: string;
  icon: LucideIcon;
}

const DATA_PLATFORM_CASE: Platfrom[] = [
  {
    title: "Earthquakes",
    href: "#",
    icon: Activity,
  },
  {
    title: "Wildfires",
    href: "#",
    icon: Flame,
  },
  {
    title: "Floods",
    href: "#",
    icon: CloudRain,
  },
  {
    title: "Cyclones",
    href: "#",
    icon: CloudLightning,
  },
  {
    title: "Tsunamis",
    href: "#",
    icon: Waves,
  },
  {
    title: "Storms",
    href: "#",
    icon: Zap,
  },
  {
    title: "Avalanches",
    href: "#",
    icon: AlertTriangle,
  },
  {
    title: "All Events",
    href: "#",
    icon: MapPin,
  },
];

interface Resource {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const DATA_RESOURCES: Resource[] = [
  {
    title: "Live Dashboard",
    description: "Access real-time disaster visualization",
    href: "#",
    icon: Activity,
  },
  {
    title: "Alert Settings",
    description: "Customize notification preferences easily",
    href: "#",
    icon: Bell,
  },
  {
    title: "Safety Tips",
    description: "Learn emergency preparedness protocols",
    href: "#",
    icon: Shield,
  },
  {
    title: "Data Sources",
    description: "Explore our trusted disaster data APIs",
    href: "#",
    icon: Map,
  },
  {
    title: "API Access",
    description: "Integrate DisasterAlert into your app",
    href: "#",
    icon: Zap,
  },
  {
    title: "Global Coverage",
    description: "Monitor disasters worldwide in real-time",
    href: "#",
    icon: MapPin,
  },
  {
    title: "Event History",
    description: "Browse past disaster events and trends",
    href: "#",
    icon: Activity,
  },
  {
    title: "Mobile Alerts",
    description: "Receive push notifications on the go",
    href: "#",
    icon: Bell,
  },
  {
    title: "Map Filters",
    description: "Filter events by type and severity level",
    href: "#",
    icon: Map,
  },
  {
    title: "Community",
    description: "Join our disaster awareness community",
    href: "#",
    icon: Shield,
  },
  {
    title: "Documentation",
    description: "Read guides and technical documentation",
    href: "#",
    icon: Zap,
  },
  {
    title: "Support",
    description: "Contact us for help or report issues",
    href: "#",
    icon: AlertTriangle,
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const [demoUser, setDemoUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieStr = document.cookie || "";
    const hasDemo = cookieStr.split(";").some((c) => c.trim().startsWith("demo_auth=1"));
    const userStr = localStorage.getItem("demo_user");
    if (hasDemo && userStr) {
      try {
        setDemoUser(JSON.parse(userStr));
      } catch {}
    } else {
      setDemoUser(null);
    }
  }, [isPending, session?.user]);

  const effectiveSession = demoUser
    ? { user: { name: demoUser.name, email: demoUser.email } }
    : session;
  const router = useRouter();

  const handleSignOut = async () => {
    // Demo sign-out path
    const cookieStr = typeof document !== "undefined" ? document.cookie : "";
    const isDemo = cookieStr.split(";").some((c) => c.trim().startsWith("demo_auth=1"));
    if (isDemo) {
      // Clear demo cookie
      document.cookie = "demo_auth=; Path=/; Max-Age=0";
      // Clear demo user
      localStorage.removeItem("demo_user");
      setDemoUser(null);
      router.push("/");
      toast.success("Signed out successfully");
      return;
    }

    // Real auth sign-out
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  return (
    <section className="fixed inset-x-0 top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-7xl mx-auto px-4 ">
        <NavigationMenu className="min-w-full">
          <div className="flex w-full items-center justify-between gap-12 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Back"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <AlertTriangle className="text-primary" />
                <span className="text-lg font-semibold tracking-tighter">
                  DisasterAlert
                </span>
              </Link>
            </div>
            <NavigationMenuList className="hidden lg:flex">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-[760px] p-4">
                  <div className="flex items-start justify-between">
                    <div className="max-w-[760px] flex-1">
                      <div className="text-xs tracking-widest text-muted-foreground">
                        Core Features
                      </div>
                      <div className="grid grid-rows-1 gap-6">
                        {DATA_SOLUTIONS.map((solution, index) => (
                          <NavigationMenuLink
                            key={index}
                            href={solution.href}
                            className="group flex flex-row items-center first:mt-4 hover:bg-transparent"
                          >
                            <div className="mr-4 rounded-lg bg-muted p-4 shadow-sm">
                              <solution.icon className="size-6 text-muted-foreground transition-all fade-in group-hover:text-foreground" />
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="font-medium text-foreground">
                                {solution.title}
                              </div>
                              <div className="text-sm font-normal text-muted-foreground">
                                {solution.description}
                              </div>
                            </div>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                    <div className="max-w-[760px] flex-1">
                      <div className="text-xs tracking-widest text-muted-foreground">
                        By Disaster Type
                      </div>
                      <div className="mt-4 gap-6">
                        {DATA_PLATFORM_CASE.map((solution, index) => (
                          <NavigationMenuLink
                            key={index}
                            href={solution.href}
                            className="group flex flex-row items-center hover:bg-transparent"
                          >
                            <div className="mr-4 rounded-lg bg-muted p-2 shadow-sm">
                              <solution.icon className="size-4 text-muted-foreground transition-all fade-in group-hover:text-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-medium">
                                {solution.title}
                              </div>
                            </div>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <Button variant="ghost">API</Button>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-full min-w-[820px] p-4">
                  <div className="grid grid-cols-3 gap-6">
                    {DATA_RESOURCES.map((solution, index) => (
                      <NavigationMenuLink
                        key={index}
                        href={solution.href}
                        className="group flex flex-row items-center hover:bg-transparent"
                      >
                        <div className="mr-4 rounded-lg bg-muted p-4 shadow-sm">
                          <solution.icon className="size-6 text-muted-foreground transition-all fade-in group-hover:text-foreground" />
                        </div>
                        <div className="flex flex-col gap-1 text-sm font-normal text-muted-foreground">
                          <div className="font-medium text-foreground">
                            {solution.title}
                          </div>
                          <div className="font-normal text-muted-foreground">
                            {solution.description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            <div className="hidden items-center gap-4 lg:flex">
              {isPending ? (
                <div className="h-9 w-24 animate-pulse bg-muted rounded" />
              ) : effectiveSession?.user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">
                      <Map className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{effectiveSession.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {effectiveSession.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <Map className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <Bell className="mr-2 h-4 w-4" />
                          Alerts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full">Get Alerts</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                aria-label="Back"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Main Menu"
                onClick={() => setOpen(!open)}
              >
                {!open && <Menu className="size-4" />}
                {open && <X className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {open && (
            <div className="absolute inset-0 top-[72px] flex h-[calc(100vh-72px)] w-full flex-col overflow-scroll border-t border-border bg-background lg:hidden">
              <div>
                <Link
                  href="#"
                  className="flex w-full items-center border-b-2 border-dashed px-8 py-4 text-left"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex-1">Features</span>
                </Link>
                <Link
                  href="#"
                  className="flex w-full items-center border-b-2 border-dashed px-8 py-4 text-left"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex-1">API</span>
                </Link>
                <Link
                  href="#"
                  className="flex w-full items-center border-b-2 border-dashed px-8 py-4 text-left"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex-1">Resources</span>
                </Link>
                {effectiveSession?.user && (
                  <Link
                    href="/dashboard"
                    className="flex w-full items-center border-b-2 border-dashed px-8 py-4 text-left"
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex-1">Dashboard</span>
                  </Link>
                )}
              </div>
              <div className="mx-[2rem] mt-auto flex flex-col gap-4 py-12">
                {effectiveSession?.user ? (
                  <>
                    <div className="text-center">
                      <p className="font-medium">{effectiveSession.user.name}</p>
                      <p className="text-sm text-muted-foreground">{effectiveSession.user.email}</p>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" size="lg">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-center">
                      Existing User?{" "}
                      <Link href="/login" className="font-bold" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </span>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="relative w-full" size="lg">
                        Get Alerts
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </NavigationMenu>
      </div>
    </section>
  );
};

export { Navbar };