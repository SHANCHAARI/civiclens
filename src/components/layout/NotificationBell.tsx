"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/types";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  issueId: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                  <p className="text-xs text-[var(--text-tertiary)]">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.issueId ? `/issues/${n.issueId}` : "#"}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 hover:bg-[var(--hover-bg)] transition-colors border-b border-[var(--border)] last:border-0",
                      !n.read && "bg-[var(--accent-subtle)]/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate">
                          {n.body}
                        </p>
                        <p className="text-[9px] text-[var(--text-tertiary)] mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
