"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: "border-green-500/30 bg-green-500/10",
  error: "border-red-500/30 bg-red-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

export default function Toast({ message, type = "info", onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[type];

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border glass",
        "transition-all duration-300",
        STYLES[type],
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <Icon size={18} className={cn({
        "text-green-500": type === "success",
        "text-red-500": type === "error",
        "text-blue-400": type === "info",
      })} />
      <span className="text-sm text-[var(--text-primary)]">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 p-0.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-tertiary)]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
