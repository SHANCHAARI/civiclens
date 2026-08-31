"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import {
  Users,
  Building2,
  Tag,
  Shield,
  Activity,
  Settings,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    const role = (session?.user as any)?.role;
    if (status === "authenticated" && role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
        setDepartments(data.departments || []);
        setCategories(data.categories || []);
        setStats(data.stats || {});
      } catch (e) {
        console.error("Failed to load admin data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const roleColors: Record<string, string> = {
    CITIZEN: "info",
    AUTHORITY: "warning",
    ADMIN: "danger",
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Admin" }]}>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 skeleton" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Admin Panel" }]}>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Admin Panel
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Platform management and configuration.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users", value: stats?.totalUsers || users.length, icon: <Users size={18} /> },
            { label: "Departments", value: departments.length, icon: <Building2 size={18} /> },
            { label: "Categories", value: categories.length, icon: <Tag size={18} /> },
            { label: "Total Issues", value: stats?.totalIssues || 0, icon: <AlertTriangle size={18} /> },
          ].map((stat, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs
          tabs={[
            { id: "users", label: "Users", count: users.length },
            { id: "departments", label: "Departments", count: departments.length },
            { id: "categories", label: "Categories", count: categories.length },
            { id: "system", label: "System" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Users */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Users
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-6 py-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                    </div>
                    <Badge
                      variant={roleColors[user.role] as any || "default"}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant={user.isActive ? "success" : "danger"}
                      size="sm"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments */}
        {activeTab === "departments" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Departments
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center gap-4 px-6 py-3"
                  >
                    <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <Building2 size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {dept.name}
                      </p>
                      {dept.description && (
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {dept.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={dept.isActive ? "success" : "danger"} size="sm">
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {activeTab === "categories" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Issue Categories
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 px-6 py-3"
                  >
                    <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <Tag size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {cat.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{cat.slug}</p>
                    </div>
                    <Badge variant={cat.isActive ? "success" : "danger"} size="sm">
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System */}
        {activeTab === "system" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                System Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Environment", value: "Development" },
                  { label: "AI Provider", value: "Mock (Demo)" },
                  { label: "Database", value: "SQLite" },
                  { label: "Map Provider", value: "OpenStreetMap" },
                  { label: "Auth Provider", value: "Credentials (Demo)" },
                  { label: "Version", value: "0.1.0" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                    <p className="text-xs text-[var(--text-tertiary)]">{item.label}</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-xs text-yellow-500 font-medium">
                  Demo Mode Active
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  This is a demonstration environment. Data shown is seeded for
                  showcase purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
