"use client";

import { useAuth } from "@/context/AuthContext";

const roleQuickActions: Record<
  string,
  { title: string; desc: string; icon: string; color: string }[]
> = {
  admin: [
    { title: "Manage Users", desc: "Add doctors, receptionists, and staff", icon: "👥", color: "from-purple-500/20 to-purple-600/10" },
    { title: "Departments", desc: "Configure hospital departments", icon: "🏢", color: "from-blue-500/20 to-blue-600/10" },
    { title: "Analytics", desc: "View system-wide statistics", icon: "📊", color: "from-primary-500/20 to-primary-600/10" },
    { title: "Settings", desc: "System configuration", icon: "⚙️", color: "from-surface-500/20 to-surface-600/10" },
  ],
  doctor: [
    { title: "My Queue", desc: "View patients waiting for you", icon: "📋", color: "from-primary-500/20 to-primary-600/10" },
    { title: "Schedule", desc: "Manage your availability", icon: "📅", color: "from-accent-500/20 to-accent-600/10" },
    { title: "Patients", desc: "View patient history", icon: "🩺", color: "from-blue-500/20 to-blue-600/10" },
  ],
  receptionist: [
    { title: "Walk-in", desc: "Register walk-in patients", icon: "🚶", color: "from-warning-500/20 to-warning-600/10" },
    { title: "Queue", desc: "Manage the live queue", icon: "📋", color: "from-primary-500/20 to-primary-600/10" },
    { title: "Check-in", desc: "Confirm patient arrivals", icon: "✅", color: "from-accent-500/20 to-accent-600/10" },
  ],
  patient: [
    { title: "Book Appointment", desc: "Schedule your next visit", icon: "📅", color: "from-primary-500/20 to-primary-600/10" },
    { title: "My Queue", desc: "Track your live position", icon: "⏳", color: "from-accent-500/20 to-accent-600/10" },
    { title: "History", desc: "View past appointments", icon: "📜", color: "from-blue-500/20 to-blue-600/10" },
  ],
};

const stats = [
  { label: "Today's Appointments", value: "—", icon: "📅", trend: null },
  { label: "Queue Length", value: "—", icon: "📋", trend: null },
  { label: "Avg. Wait Time", value: "—", icon: "⏱️", trend: null },
  { label: "Completed Today", value: "—", icon: "✅", trend: null },
];

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const greeting = getGreeting();
  const actions = roleQuickActions[user.role] || roleQuickActions.patient;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-surface-50">
          {greeting},{" "}
          <span className="gradient-text">{user.full_name.split(" ")[0]}</span>
        </h1>
        <p className="text-surface-400 mt-1">
          Here&apos;s your hospital overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass rounded-2xl p-5 glass-hover transition-all duration-300 animate-slide-up stagger-${i + 1}`}
            style={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
            <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-surface-200 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <button
              key={action.title}
              className={`group relative glass rounded-2xl p-6 text-left transition-all duration-300 hover:border-primary-500/30 cursor-pointer animate-slide-up stagger-${i + 1}`}
              style={{ opacity: 0 }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative">
                <span className="text-3xl mb-3 block">{action.icon}</span>
                <h3 className="font-semibold text-surface-100 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-surface-400">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="glass rounded-2xl p-6 border-dashed border-surface-700/50">
        <div className="flex items-start gap-4">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-semibold text-surface-200 mb-1">
              Phase 2 Coming Soon
            </h3>
            <p className="text-sm text-surface-400">
              Appointment booking, doctor schedules, and the live queue system
              are being built. Stay tuned for real-time updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
