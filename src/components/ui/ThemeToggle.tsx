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
      document.documentElement.classList.remove("dark");
    } else {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    document.documentElement.classList.add("theme-transition");
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("civiclens-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("civiclens-theme", "light");
    }
    setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative p-2 rounded-xl transition-all duration-200",
        "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
        "hover:bg-[var(--hover-bg)]",
        className
      )}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            !dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
}
