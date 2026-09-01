"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  Camera, MapPin, Brain, CheckCircle2, ArrowRight, ArrowLeft,
  AlertTriangle, Loader2, X, Upload, ChevronLeft, Eye, FileText,
} from "lucide-react";
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from "@/types";

const STEPS = [
  { id: "category", label: "What happened?" },
  { id: "location", label: "Where is it?" },
  { id: "evidence", label: "Show us" },
  { id: "confirm", label: "Confirm" },
];

const CATEGORY_ICONS: Record<string, string> = {
  pothole: "🛣",
  "road-damage": "🛣",
  "broken-streetlight": "💡",
  "garbage-waste": "🗑",
  "water-leakage": "💧",
  "drainage-problem": "💧",
  "damaged-sidewalk": "🚶",
  "fallen-tree": "🌳",
  "traffic-signal-issue": "🚦",
  "illegal-dumping": "🗑",
  "public-infrastructure-damage": "🏗",
  other: "📋",
};

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    categorySlug: "",
    severity: "MEDIUM" as string,
    latitude: 17.385,
    longitude: 78.4867,
    address: "",
    landmark: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const categories = Object.keys(CATEGORY_CONFIG);
    const selectedCat = form.categorySlug || categories[Math.floor(Math.random() * categories.length)];
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const randomSev = severities[Math.floor(Math.random() * severities.length)];

    const mockAnalysis = {
      category: CATEGORY_CONFIG[selectedCat]?.name || "Other",
      categorySlug: selectedCat,
      categoryConfidence: (0.78 + Math.random() * 0.2).toFixed(2),
      severity: randomSev,
      severityConfidence: (0.7 + Math.random() * 0.25).toFixed(2),
      description: `Detected ${CATEGORY_CONFIG[selectedCat]?.name || "issue"} from visual evidence. Severity assessed as ${randomSev.toLowerCase()}.`,
      observations: ["Visual evidence analyzed", "Public area detected", "Severity indicators found"],
    };

    setAnalysis(mockAnalysis);
    setForm((prev) => ({
      ...prev,
      categorySlug: selectedCat,
      severity: randomSev,
      title: `${CATEGORY_CONFIG[selectedCat]?.name || "Issue"} reported`,
    }));
    setAnalyzing(false);
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        () => {}
      );
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      const issue = await res.json();
      setStep(4);
      setTimeout(() => router.push(`/issues/${issue.id}`), 3500);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <AppLayout breadcrumbs={[{ label: "Report" }]}>
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-[var(--accent-civic)] text-white"
                      : i === step
                      ? "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)] border border-[var(--accent-civic)]/30"
                      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border)]"
                  }`}
                >
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden md:block ${
                    i <= step ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3">
                  <div
                    className="h-px transition-all duration-500"
                    style={{
                      backgroundColor: i < step ? "var(--accent-civic)" : "var(--border)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in" key={step}>
          {/* STEP 01 — What happened? */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-civic)] mb-2 font-medium">
                  Step 01
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
                  What happened?
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Select the type of civic issue you&apos;ve observed.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(CATEGORY_CONFIG).map(([slug, config]) => (
                  <button
                    key={slug}
                    onClick={() => setForm((prev) => ({ ...prev, categorySlug: slug }))}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                      form.categorySlug === slug
                        ? "border-[var(--accent-civic)] bg-[var(--accent-civic-dim)] shadow-[0_0_0_1px_var(--accent-civic)]/20"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <span className="text-2xl block mb-2">
                      {CATEGORY_ICONS[slug] || "📋"}
                    </span>
                    <p
                      className={`text-xs font-semibold ${
                        form.categorySlug === slug
                          ? "text-[var(--accent-civic)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {config.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(1)} disabled={!form.categorySlug}>
                  Continue <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 02 — Where is it? */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-civic)] mb-2 font-medium">
                  Step 02
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
                  Where is it?
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Pinpoint the location of the issue.
                </p>
              </div>

              <Button variant="outline" onClick={getCurrentPosition} className="w-full">
                <MapPin size={15} /> Use My Current Location
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))
                  }
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <Input
                label="Address (optional)"
                placeholder="123 Main Street, near City Park"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />

              <Input
                label="Landmark (optional)"
                placeholder="Near SBI Bank, opposite bus stop"
                value={form.landmark}
                onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
              />

              {/* Location Preview */}
              <div className="h-44 rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center relative">
                <div className="text-center">
                  <MapPin size={24} className="mx-auto text-[var(--accent-civic)] mb-2" />
                  <p className="text-xs text-[var(--text-tertiary)] font-mono">
                    {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="absolute top-3 left-3 glass-elevated rounded-lg px-2 py-1 text-[10px] text-[var(--text-tertiary)]">
                  Location Preview
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ChevronLeft size={15} /> Back
                </Button>
                <Button onClick={() => setStep(2)}>
                  Continue <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 03 — Show us */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-civic)] mb-2 font-medium">
                  Step 03
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
                  Show us
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Upload evidence and describe what you see.
                </p>
              </div>

              {/* Image Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? "border-[var(--accent-civic)] bg-[var(--accent-civic-dim)]"
                    : "border-[var(--border)] hover:border-[var(--accent-civic)] hover:bg-[var(--accent-civic-dim)]/30"
                }`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Evidence"
                      className="max-h-56 mx-auto rounded-xl object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    {!analysis && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runAnalysis();
                        }}
                        className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg glass-elevated text-xs font-medium text-[var(--accent-civic)] flex items-center gap-1.5"
                      >
                        <Brain size={12} /> Analyze with AI
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--accent-civic-dim)] text-[var(--accent-civic)] flex items-center justify-center">
                      <Camera size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Tap to upload a photo
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                        JPG, PNG, or WebP · Max 10MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* AI Analysis Result */}
              {analyzing && (
                <div className="flex flex-col items-center py-8 space-y-3 animate-fade-in">
                  <Loader2 size={28} className="text-[var(--accent-civic)] animate-spin" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    Analyzing evidence...
                  </p>
                  <div className="w-40 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-civic)] rounded-full"
                      style={{ width: "70%", animation: "pulse 1.5s infinite" }}
                    />
                  </div>
                </div>
              )}

              {analysis && !analyzing && (
                <div className="p-4 rounded-2xl border border-[var(--accent-civic)]/20 bg-[var(--accent-civic-dim)] space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--accent-civic)]" />
                    <span className="text-xs font-medium text-[var(--accent-civic)]">
                      Analysis complete
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Category</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {analysis.category}
                      </p>
                      <p className="text-[10px] text-[var(--accent-civic)]">
                        {Math.round(analysis.categoryConfidence * 100)}% confident
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Severity</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {analysis.severity}
                      </p>
                      <p className="text-[10px] text-[var(--accent-civic)]">
                        {Math.round(analysis.severityConfidence * 100)}% confident
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Brief description of the issue"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  label="Description (optional)"
                  placeholder="What do you see? How long has it been there?"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
                  Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setForm((prev) => ({ ...prev, severity: sev }))}
                      className={`p-3 rounded-xl text-[11px] font-medium text-center transition-all border ${
                        form.severity === sev
                          ? `${SEVERITY_CONFIG[sev].bgColor} border-current`
                          : "border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {SEVERITY_CONFIG[sev].label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-[var(--accent-red)] bg-[var(--accent-red-dim)] px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={15} /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!form.title}
                >
                  Review Report <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 04 — Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-civic)] mb-2 font-medium">
                  Step 04
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
                  Confirm
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Review your report before submitting.
                </p>
              </div>

              {/* Preview Card */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
                {/* Category */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[form.categorySlug] || "📋"}</span>
                  <div>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Category</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {CATEGORY_CONFIG[form.categorySlug]?.name || "Other"}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[var(--border-subtle)]" />

                {/* Title */}
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Title</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{form.title}</p>
                </div>

                {form.description && (
                  <div>
                    <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Description</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {form.description}
                    </p>
                  </div>
                )}

                <div className="h-px bg-[var(--border-subtle)]" />

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[var(--accent-civic)]" />
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      {form.latitude.toFixed(3)}, {form.longitude.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-[var(--accent-amber)]" />
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      Severity: {form.severity}
                    </span>
                  </div>
                </div>

                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                    <img src={imagePreview} alt="Evidence" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-[var(--accent-red)] bg-[var(--accent-red-dim)] px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={15} /> Back
                </Button>
                <Button onClick={handleSubmit} loading={submitting} disabled={!form.title}>
                  <CheckCircle2 size={15} /> Submit Report
                </Button>
              </div>
            </div>
          )}

          {/* STEP 05 — Success */}
          {step === 4 && (
            <div className="flex flex-col items-center py-16 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-civic-dim)] flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[var(--accent-civic)]" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-2">
                  Your voice is now on the map.
                </h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                  Your report has been submitted and will be analyzed by civic intelligence.
                  You&apos;ll be notified when the status changes.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[var(--accent-civic)]" />
                  <span>Location recorded</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Brain size={12} className="text-[var(--accent-blue)]" />
                  <span>AI analyzing</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Redirecting to your issue...</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
