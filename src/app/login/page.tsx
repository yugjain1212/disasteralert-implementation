"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Shield, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        setIsLoading(false);
        return;
      }

      // Ensure cookies are set and then navigate fast
      await supabase.auth.getSession();
      toast.success("Welcome back!");
      router.replace("/dashboard");
      // Hard redirect fallback to avoid any client-side routing issues
      window.location.assign("/dashboard");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column - Brand/Image Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-primary/70 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <div className="relative z-20 flex flex-col justify-between h-full p-12">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <Shield className="h-8 w-8" />
              <h1 className="text-2xl font-bold">DisasterAlert</h1>
            </div>
            <h2 className="text-4xl font-bold mb-6">Welcome to the Professional Disaster Management Platform</h2>
            <p className="text-lg opacity-90 max-w-md">
              Access real-time alerts, interactive maps, and critical data to manage and respond to natural disasters effectively.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Enterprise-Grade Security</h3>
                <p className="opacity-80 text-sm">Your data is protected with industry-leading encryption standards</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Real-Time Monitoring</h3>
                <p className="opacity-80 text-sm">Get instant alerts and updates on developing situations</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg width="400" height="400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="4" fill="none" />
          </svg>
        </div>
      </div>
      
      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center mb-8">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">DisasterAlert</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign in to your account</h2>
            <p className="text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="bg-background pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    className="bg-background pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, rememberMe: checked as boolean })
                    }
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in to dashboard"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By signing in, you agree to our
            {" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
