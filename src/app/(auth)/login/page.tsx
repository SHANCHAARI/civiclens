"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, ArrowRight, User, Shield, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ThemeToggle from "@/components/ui/ThemeToggle";

const DEMO_USERS = [
  {
    label: "Citizen",
    email: "citizen@demo.com",
    icon: <User size={16} />,
    desc: "Report issues, track progress",
  },
  {
    label: "Authority",
    email: "authority@demo.com",
    icon: <Shield size={16} />,
    desc: "Manage and resolve issues",
  },
  {
    label: "Admin",
    email: "admin@demo.com",
    icon: <Settings size={16} />,
    desc: "Full platform management",
  },
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
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-atmosphere flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center">
              <Eye size={22} />
            </div>
            <span className="text-xl font-bold">CivicLens</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Sign in to continue to CivicLens
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-tertiary)] mb-3 text-center">
              Quick demo login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleLogin(user.email, "demo123")}
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all duration-200 disabled:opacity-50"
                >
                  <div className="text-[var(--accent)]">{user.icon}</div>
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {user.label}
                  </span>
                  <span className="text-[9px] text-[var(--text-tertiary)]">
                    {user.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
