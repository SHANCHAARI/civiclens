"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Eye,
  MapPin,
  Brain,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Users,
  Zap,
  Target,
  Globe,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";

function FloatingCard({
  title,
  severity,
  reports,
  delay,
}: {
  title: string;
  severity: string;
  reports: number;
  delay: number;
}) {
  const colors: Record<string, string> = {
    CRITICAL: "border-red-500/30",
    HIGH: "border-orange-500/30",
    MEDIUM: "border-yellow-500/30",
  };
  return (
    <div
      className={`glass rounded-xl p-3 shadow-lg ${colors[severity] || "border-[var(--border)]"} animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-2 h-2 rounded-full ${
            severity === "CRITICAL"
              ? "bg-red-500"
              : severity === "HIGH"
              ? "bg-orange-500"
              : "bg-yellow-500"
          }`}
        />
        <span className="text-xs font-medium text-[var(--text-primary)]">{title}</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
        <span>{severity}</span>
        <span>{reports} reports</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-atmosphere">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
              <Eye size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">CivicLens</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Dashboard <ArrowRight size={14} />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Sign In <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background map effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-60 left-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-xs font-medium mb-6">
                <Zap size={12} />
                AI-Powered Civic Intelligence
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                <span className="text-[var(--text-primary)]">See a problem.</span>
                <br />
                <span className="text-[var(--accent)]">Prove it.</span>
                <br />
                <span className="text-[var(--text-primary)]">Fix it.</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-lg mb-8 leading-relaxed">
                CivicLens turns real-world civic problems into verified, prioritized,
                trackable action. Report issues, track resolutions, and hold your city
                accountable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/report">
                  <Button size="lg">
                    Report an Issue <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" variant="outline">
                    Explore Civic Map <MapPin size={18} />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-12">
                {[
                  { label: "Issues Reported", value: "12,847" },
                  { label: "Resolved", value: "9,234" },
                  { label: "Cities", value: "47" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Map background */}
                <div className="absolute inset-0 rounded-3xl glass overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--accent-subtle)] to-transparent opacity-50" />
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-[var(--border)]" />
                    ))}
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute top-8 -left-4">
                  <FloatingCard title="Pothole" severity="HIGH" reports={18} delay={200} />
                </div>
                <div className="absolute top-1/3 -right-8">
                  <FloatingCard title="Broken Streetlight" severity="MEDIUM" reports={7} delay={400} />
                </div>
                <div className="absolute bottom-16 left-4">
                  <FloatingCard title="Fallen Tree" severity="CRITICAL" reports={23} delay={600} />
                </div>
                <div className="absolute bottom-1/4 right-8">
                  <FloatingCard title="Water Leakage" severity="HIGH" reports={12} delay={800} />
                </div>

                {/* Center marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 animate-pulse">
                    <MapPin size={28} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              From evidence to accountability in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <MapPin size={24} />,
                title: "Capture",
                desc: "Take a photo of the issue. Your location is automatically detected.",
              },
              {
                icon: <Brain size={24} />,
                title: "Analyze",
                desc: "AI classifies the issue, estimates severity, and identifies duplicates.",
              },
              {
                icon: <Target size={24} />,
                title: "Prioritize",
                desc: "Smart scoring considers severity, impact, location, and citizen reports.",
              },
              {
                icon: <CheckCircle2 size={24} />,
                title: "Resolve",
                desc: "Track progress, verify fixes, and hold authorities accountable.",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="glass rounded-2xl p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-1 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 text-[var(--text-tertiary)]">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Intelligence, Not Just Complaints
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              CivicLens combines AI, geospatial analysis, and community participation
              to create real accountability.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain size={20} />,
                title: "AI Analysis",
                desc: "Automatic issue classification, severity estimation, and evidence extraction from photos.",
              },
              {
                icon: <Globe size={20} />,
                title: "Geospatial Intelligence",
                desc: "Heatmaps, clustering, proximity analysis, and geographic pattern detection.",
              },
              {
                icon: <Shield size={20} />,
                title: "Duplicate Detection",
                desc: "Smart matching prevents duplicate reports and combines citizen evidence.",
              },
              {
                icon: <BarChart3 size={20} />,
                title: "Civic Analytics",
                desc: "Ward-level insights, trend analysis, and department performance metrics.",
              },
              {
                icon: <Users size={20} />,
                title: "Community Verification",
                desc: "Citizens verify resolutions, ensuring fixes are real and lasting.",
              },
              {
                icon: <Zap size={20} />,
                title: "Priority Scoring",
                desc: "Transparent, multi-factor priority calculation that explains its reasoning.",
              },
            ].map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Your city needs your eyes.
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              Every report matters. Every photo is evidence. Every voice pushes
              for change.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={session ? "/report" : "/login"}>
                <Button size="lg">
                  Start Reporting <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline">
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-medium">CivicLens</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Built for civic accountability. Open source.
          </p>
        </div>
      </footer>
    </div>
  );
}
