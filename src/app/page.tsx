"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Eye, ArrowRight, MapPin, Brain, Shield, BarChart3,
  Users, TrendingUp, CheckCircle2, ChevronRight, ArrowUpRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";

// === INTERACTIVE LENS HERO ===
function LensHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate city grid points
    const points: Array<{ x: number; y: number; size: number; color: string; speed: number; phase: number }> = [];
    for (let i = 0; i < 120; i++) {
      const colors = ["#3ecf8e", "#e5a54b", "#ef6461", "#5b9cf5", "#8b5cf6"];
      points.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        size: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Grid lines
    const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
    for (let i = 0; i < 40; i++) {
      const isHorizontal = Math.random() > 0.5;
      if (isHorizontal) {
        const y = Math.random() * 2000;
        gridLines.push({ x1: 0, y1: y, x2: 2000, y2: y + (Math.random() - 0.5) * 100, opacity: 0.03 + Math.random() * 0.04 });
      } else {
        const x = Math.random() * 2000;
        gridLines.push({ x1: x, y1: 0, x2: x + (Math.random() - 0.5) * 100, y2: 2000, opacity: 0.03 + Math.random() * 0.04 });
      }
    }

    let animFrame: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, w, h);

      // Draw grid
      ctx.strokeStyle = "currentColor";
      for (const line of gridLines) {
        ctx.globalAlpha = line.opacity;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      // Draw connecting lines between nearby points
      ctx.globalAlpha = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.globalAlpha = (1 - dist / 80) * 0.06;
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      const mx = mouseRef.current.x * 2000 / (canvas.parentElement?.getBoundingClientRect().width || 1);
      const my = mouseRef.current.y * 1200 / (canvas.parentElement?.getBoundingClientRect().height || 1);
      const lensRadius = 180;

      for (const p of points) {
        const pulse = Math.sin(time * p.speed + p.phase) * 0.3 + 0.7;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inLens = dist < lensRadius;
        const scale = inLens ? 1 + (1 - dist / lensRadius) * 0.8 : 1;
        const alpha = inLens ? 0.9 : 0.25 * pulse;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * scale * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Glow in lens
        if (inLens) {
          ctx.globalAlpha = alpha * 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * scale * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw lens circle
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#3ecf8e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, lensRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.arc(mx, my, lensRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.moveTo(mx - 12, my);
      ctx.lineTo(mx + 12, my);
      ctx.moveTo(mx, my - 12);
      ctx.lineTo(mx, my + 12);
      ctx.stroke();

      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(draw);
    };

    draw();

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.parentElement!.addEventListener("mousemove", handleMouse);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      canvas.parentElement?.removeEventListener("mousemove", handleMouse);
    };
  }, [mounted]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
      {mounted && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />}
      {/* Lens info overlay */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 glass rounded-lg px-3 py-2 text-[10px] text-[var(--text-tertiary)] space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-civic)]" />
          <span>128 active signals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)]" />
          <span>7 neighborhoods</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />
          <span>3 critical clusters</span>
        </div>
      </div>
      {/* Coordinates overlay */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 glass rounded-lg px-3 py-2 text-[10px] text-[var(--text-tertiary)] font-mono pointer-events-none">
        <span>17.3850°N 78.4867°E</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <p className="text-[10px] text-[var(--text-tertiary)]/60 uppercase tracking-[0.3em]">Move cursor to explore</p>
      </div>
    </div>
  );
}

// === SECTIONS ===
const SECTIONS = [
  {
    label: "THE PROBLEM",
    title: "A problem can exist for months before anyone knows who is responsible.",
    body: "Infrastructure issues hide in plain sight. Citizens see them daily but have no way to make them visible, trackable, or accountable.",
    color: "var(--accent-red)",
  },
  {
    label: "THE SOLUTION",
    title: "Civic Lens brings every signal into focus.",
    body: "One photo transforms a hidden problem into verified, prioritized civic intelligence. AI classifies, clusters, and routes issues to the people who can fix them.",
    color: "var(--accent-civic)",
  },
  {
    label: "CIVIC INTELLIGENCE",
    title: "27 reports. One signal.",
    body: "Civic Lens automatically identifies when multiple citizens report the same issue. Individual complaints become a single, verified civic signal that demands action.",
    color: "var(--accent-blue)",
  },
  {
    label: "ACTION",
    title: "A report shouldn't disappear after you press submit.",
    body: "Every signal is tracked through its entire lifecycle — from first report to verified resolution. Citizens follow the journey. Authorities are held accountable.",
    color: "var(--accent-amber)",
  },
  {
    label: "TRANSPARENCY",
    title: "Know what happened next.",
    body: "No black boxes. No vague responses. Every status change, every assignment, every action is visible. Transparency is not a feature — it's the foundation.",
    color: "var(--accent-civic)",
  },
];

const STATS = [
  { value: "1,284", label: "Reports this month", icon: <MapPin size={14} /> },
  { value: "742", label: "Issues verified", icon: <CheckCircle2 size={14} /> },
  { value: "318", label: "Issues resolved", icon: <TrendingUp size={14} /> },
  { value: "87", label: "Neighborhoods active", icon: <Users size={14} /> },
];

const CATEGORIES = [
  { name: "Roads", icon: "🛣", color: "var(--severity-high)" },
  { name: "Water", icon: "💧", color: "var(--accent-blue)" },
  { name: "Electricity", icon: "💡", color: "var(--accent-amber)" },
  { name: "Waste", icon: "🗑", color: "var(--text-tertiary)" },
  { name: "Environment", icon: "🌳", color: "var(--accent-civic)" },
  { name: "Traffic", icon: "🚦", color: "var(--accent-red)" },
  { name: "Infrastructure", icon: "🏗", color: "var(--text-secondary)" },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = sectionRefs.current.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* === NAV === */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-civic)] flex items-center justify-center">
              <Eye size={14} className="text-[var(--text-inverse)]" />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">Civic Lens</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/map" className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg">
              Discover
            </Link>
            <Link href="/analytics" className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg">
              Insights
            </Link>
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard"><Button size="sm">Dashboard</Button></Link>
            ) : (
              <Link href="/login"><Button size="sm">Sign In</Button></Link>
            )}
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-civic)] font-medium mb-4">
              Civic Intelligence Platform
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-5 text-[var(--text-primary)]">
              See your city<br />
              <span className="text-[var(--accent-civic)]">differently.</span>
            </h1>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg mb-8">
              Civic Lens turns local problems into visible, trackable, actionable civic intelligence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={session ? "/map" : "/login"}>
                <Button size="lg">
                  Explore Civic Lens <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href={session ? "/report" : "/login"}>
                <Button size="lg" variant="outline">
                  Report an Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Lens Hero */}
          <LensHero />

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-px rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[var(--bg-secondary)] p-4 md:p-5">
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-1.5">
                  {stat.icon}
                  <span className="text-[10px] uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)] font-mono">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === NARRATIVE SECTIONS === */}
      {SECTIONS.map((section, i) => (
        <section
          key={section.label}
          ref={(el) => { sectionRefs.current[i + 1] = el; }}
          className={`py-20 md:py-32 px-6 transition-all duration-700 ${
            visibleSections.has(i + 1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-3" style={{ color: section.color }}>
                {section.label}
              </p>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-4 text-[var(--text-primary)]">
                {section.title}
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                {section.body}
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* === CATEGORIES === */}
      <section className="py-20 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-civic)] font-medium mb-3">
            ISSUE CATEGORIES
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10 text-[var(--text-primary)]">
            Every signal has a category.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer group"
              >
                <span className="text-lg block mb-2">{cat.icon}</span>
                <p className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === COMMUNITY === */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-civic)] font-medium mb-3">
            COMMUNITY
          </p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-6 text-[var(--text-primary)] max-w-2xl">
            A city becomes smarter when its citizens participate.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-lg mb-12">
            Citizens shouldn't feel like they're submitting complaints into a black hole. 
            They should see Report → Community → Verification → Action → Resolution.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "27", desc: "citizens reported road damage near the central market", tag: "VERIFIED CLUSTER" },
              { num: "156", desc: "issues resolved this month across 12 neighborhoods", tag: "RESOLUTION RATE" },
              { num: "12", desc: "minutes average first response time for critical issues", tag: "RESPONSE TIME" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3">{item.tag}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] font-mono mb-2">{item.num}</p>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CIVIC PULSE === */}
      <section className="py-20 md:py-32 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent-civic)] font-medium mb-3">
            CIVIC PULSE
          </p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
            What is changing around your city?
          </h2>
          <p className="text-base text-[var(--text-secondary)] max-w-lg mb-12">
            Real-time intelligence from citizen reports, verified signals, and community activity.
          </p>

          {/* Minimal bar chart */}
          <div className="space-y-3 max-w-xl">
            {[
              { label: "Road damage", value: 42, max: 50 },
              { label: "Water issues", value: 28, max: 50 },
              { label: "Streetlight", value: 19, max: 50 },
              { label: "Waste management", value: 15, max: 50 },
              { label: "Drainage", value: 12, max: 50 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-xs text-[var(--text-secondary)] w-28 shrink-0">{item.label}</span>
                <div className="flex-1 h-6 bg-[var(--bg-secondary)] rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-civic)]/20 rounded-md flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  >
                    <span className="text-[10px] font-medium text-[var(--accent-civic)]">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
            Your city is already<br />telling a story.
          </h2>
          <p className="text-base text-[var(--text-secondary)] mb-10 max-w-md mx-auto">
            Start looking closer.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={session ? "/map" : "/login"}>
              <Button size="lg">
                Explore Civic Lens <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href={session ? "/report" : "/login"}>
              <Button size="lg" variant="outline">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[var(--accent-civic)]" />
            <span className="text-xs font-bold uppercase tracking-wider">Civic Lens</span>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Civic problems should never become invisible.
          </p>
        </div>
      </footer>
    </div>
  );
}
