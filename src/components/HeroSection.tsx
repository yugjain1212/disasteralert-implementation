"use client";

import { ChevronRight, AlertTriangle, Shield, Activity } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative container max-w-7xl mx-auto px-4 min-h-[90vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left content */}
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Monitoring Active</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Stay Informed,{" "}
              <span className="text-primary">Stay Safe</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Real-time natural disaster alerts that matter to you. Track earthquakes, floods, 
              wildfires, and storms worldwide with personalized notifications and AI-powered safety guidance.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-foreground font-semibold">12 Active Events</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-foreground font-semibold">48 Last 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-foreground font-semibold">2.4M Protected</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="group h-14 px-8 text-lg">
                  Get Alerts
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  <Activity className="mr-2 h-5 w-5" />
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Right content - Visualization */}
          <div className="relative lg:h-[600px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Animated pulse circles */}
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-4 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                <div className="absolute inset-8 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '1s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute top-20 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earthquake</p>
                    <p className="font-semibold">M 6.2 Tokyo</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wildfire</p>
                    <p className="font-semibold">California</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };