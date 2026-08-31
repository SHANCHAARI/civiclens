"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("civiclens-theme");
    if (saved === "light") {
      setDark(false);
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    document.documentElement.classList.add("theme-transition");
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("civiclens-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("civiclens-theme", "light");
    }
    setTimeout(() => document.documentElement.classList.remove("theme-transition"), 500);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative w-10 h-10 rounded-lg flex items-center justify-center",
        "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
        "hover:bg-[var(--bg-elevated)] transition-all duration-300",
        className
      )}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative w-4.5 h-4.5">
        <Sun
          size={16}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          size={16}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            !dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
}
