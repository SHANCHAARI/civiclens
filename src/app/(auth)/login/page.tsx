"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, ArrowRight, User, Shield, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ThemeToggle from "@/components/ui/ThemeToggle";

const DEMO_USERS = [
  { label: "Citizen", email: "citizen@demo.com", icon: <User size={16} />, desc: "Report and track" },
  { label: "Authority", email: "authority@demo.com", icon: <Shield size={16} />, desc: "Manage issues" },
  { label: "Admin", email: "admin@demo.com", icon: <Settings size={16} />, desc: "Full access" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid credentials. Try a demo account below.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-civic)] flex items-center justify-center">
              <Eye size={16} className="text-[var(--text-inverse)]" />
            </div>
            <span className="text-sm font-bold uppercase tracking-tight">Civic Lens</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Sign in to your account</p>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-xs text-[var(--accent-red)] bg-[var(--accent-red-dim)] px-3 py-2 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In <ArrowRight size={14} />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-3 text-center">Quick demo</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user.email, "demo123")}
                disabled={loading}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-civic)] hover:bg-[var(--accent-civic-dim)] transition-all duration-200 disabled:opacity-40"
              >
                <div className="text-[var(--accent-civic)]">{user.icon}</div>
                <span className="text-[11px] font-medium text-[var(--text-primary)]">{user.label}</span>
                <span className="text-[9px] text-[var(--text-tertiary)]">{user.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
