"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import {
  Upload,
  Camera,
  MapPin,
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  FileImage,
  X,
} from "lucide-react";
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from "@/types";

const STEPS = [
  { id: "upload", label: "Upload Evidence", icon: <Camera size={16} /> },
  { id: "analyze", label: "AI Analysis", icon: <Brain size={16} /> },
  { id: "category", label: "Confirm Category", icon: <CheckCircle2 size={16} /> },
  { id: "location", label: "Location", icon: <MapPin size={16} /> },
  { id: "details", label: "Details", icon: <AlertTriangle size={16} /> },
  { id: "submit", label: "Submit", icon: <CheckCircle2 size={16} /> },
];

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
    categorySlug: "pothole",
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
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setStep(1);

    // Simulate AI analysis with a delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock analysis result
    const categories = Object.keys(CATEGORY_CONFIG);
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const randomSev = severities[Math.floor(Math.random() * severities.length)];

    const mockAnalysis = {
      category: CATEGORY_CONFIG[randomCat]?.name || "Other",
      categorySlug: randomCat,
      categoryConfidence: (0.75 + Math.random() * 0.23).toFixed(2),
      severity: randomSev,
      severityConfidence: (0.7 + Math.random() * 0.25).toFixed(2),
      description: `AI-detected issue classified as ${CATEGORY_CONFIG[randomCat]?.name || "Other"}. Severity assessed as ${randomSev.toLowerCase()} based on visual evidence analysis.`,
      observations: [
        "Visual evidence analyzed successfully",
        "Issue appears to be in a public area",
        "Severity indicators detected",
      ],
      suggestedDepartment: "ROAD_INFRASTRUCTURE",
    };

    setAnalysis(mockAnalysis);
    setForm((prev) => ({
      ...prev,
      categorySlug: randomCat,
      severity: randomSev,
      title: `${CATEGORY_CONFIG[randomCat]?.name || "Issue"} reported`,
    }));
    setAnalyzing(false);
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        () => {
          // Use default position
        }
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
      setStep(5);

      // Redirect after a moment
      setTimeout(() => {
        router.push(`/issues/${issue.id}`);
      }, 2000);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: "Report Issue" }]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Report an Issue
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Capture evidence. AI will analyze and categorize it automatically.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? "bg-[var(--accent)] text-white"
                    : i < step
                    ? "bg-green-500/10 text-green-500"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                }`}
              >
                {i < step ? <CheckCircle2 size={14} /> : s.icon}
                <span className="hidden md:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 h-px mx-1 ${
                    i < step ? "bg-green-500" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-6">
          {/* Step 0: Upload */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Capture Evidence
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Upload a photo of the civic issue. AI will analyze it automatically.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]/50"
                }`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Evidence"
                      className="max-h-64 mx-auto rounded-xl object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        Click to upload a photo
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        JPG, PNG, or WebP. Max 10MB.
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

              <div className="flex justify-end">
                <Button
                  onClick={runAnalysis}
                  disabled={!imagePreview}
                >
                  Analyze with AI <Brain size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: AI Analysis */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  AI Analysis
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Analyzing your evidence...
                </p>
              </div>

              {analyzing ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <Loader2 size={40} className="text-[var(--accent)] animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)] animate-pulse">
                    Analyzing evidence...
                  </p>
                  <div className="w-48 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "70%" }} />
                  </div>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        Analysis Complete
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Category</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {analysis.category}
                      </p>
                      <p className="text-xs text-[var(--accent)]">
                        {Math.round(analysis.categoryConfidence * 100)}% confidence
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Severity</p>
                      <Badge
                        variant={
                          analysis.severity === "CRITICAL"
                            ? "danger"
                            : analysis.severity === "HIGH"
                            ? "warning"
                            : "info"
                        }
                        size="md"
                      >
                        {analysis.severity}
                      </Badge>
                      <p className="text-xs text-[var(--accent)] mt-1">
                        {Math.round(analysis.severityConfidence * 100)}% confidence
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Description</p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {analysis.description}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Observations</p>
                    <ul className="space-y-1">
                      {analysis.observations.map((obs: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-[var(--accent)] mt-0.5">•</span>
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--accent-subtle)] text-xs text-[var(--accent)]">
                    AI confidence is {Math.round(analysis.categoryConfidence * 100)}%.
                    {analysis.categoryConfidence < 0.8
                      ? " Human review recommended."
                      : " Classification looks reliable."}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(0)}>
                      <ArrowLeft size={16} /> Back
                    </Button>
                    <Button onClick={() => setStep(2)}>
                      Continue <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 2: Category Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Confirm Category
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  AI suggested the category below. You can change it if needed.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(CATEGORY_CONFIG).map(([slug, config]) => (
                  <button
                    key={slug}
                    onClick={() => setForm((prev) => ({ ...prev, categorySlug: slug }))}
                    className={`p-3 rounded-xl text-left text-sm transition-all ${
                      form.categorySlug === slug
                        ? "bg-[var(--accent-subtle)] border-2 border-[var(--accent)] text-[var(--accent)]"
                        : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Location
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Where is this issue? Use your current location or enter it manually.
                </p>
              </div>

              <Button variant="outline" onClick={getCurrentPosition} className="w-full">
                <MapPin size={16} /> Use My Current Location
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
                placeholder="e.g., 123 Main Street, near City Park"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />

              <Input
                label="Landmark (optional)"
                placeholder="e.g., Near SBI Bank, opposite bus stop"
                value={form.landmark}
                onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
              />

              {/* Mini map preview */}
              <div className="h-48 rounded-xl overflow-hidden border border-[var(--border)] relative">
                <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={24} className="mx-auto text-[var(--accent)] mb-2" />
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 left-2 glass rounded-lg px-2 py-1 text-[10px] text-[var(--text-tertiary)]">
                  Location Preview
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Issue Details
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Provide a title, description, and severity level.
                </p>
              </div>

              <Input
                label="Title"
                placeholder="Brief description of the issue"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />

              <Textarea
                label="Description"
                placeholder="Describe the issue in detail. What do you see? How long has it been there? Is it getting worse?"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setForm((prev) => ({ ...prev, severity: sev }))}
                      className={`p-3 rounded-xl text-xs font-medium text-center transition-all ${
                        form.severity === sev
                          ? `${SEVERITY_CONFIG[sev].bgColor} ring-2 ring-current`
                          : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {SEVERITY_CONFIG[sev].label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!form.title || !form.description}
                >
                  Submit Report <CheckCircle2 size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="flex flex-col items-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Issue Reported!
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm">
                Your report has been submitted and will be analyzed. You&apos;ll be
                notified of updates.
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">Redirecting...</p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
