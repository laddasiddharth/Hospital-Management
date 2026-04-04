"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const roleQuickActions: Record<
  string,
  { title: string; desc: string; icon: string; color: string; href: string }[]
> = {
  admin: [
    { title: "Departments", desc: "Configure hospital wards", icon: "🏢", color: "bg-blue-50 text-blue-600 border-blue-100", href: "/dashboard/departments" },
    { title: "Doctors", desc: "Manage physician directory", icon: "👨‍⚕️", color: "bg-primary-50 text-primary-600 border-primary-100", href: "/dashboard/doctors" },
    { title: "Appointments", desc: "System-wide scheduling", icon: "📊", color: "bg-purple-50 text-purple-600 border-purple-100", href: "/dashboard/appointments" },
  ],
  doctor: [
    { title: "My Schedule", desc: "View appointment queue", icon: "📅", color: "bg-emerald-50 text-emerald-600 border-emerald-100", href: "/dashboard/appointments" },
    { title: "Live Queue", desc: "Advance patient list", icon: "📋", color: "bg-primary-50 text-primary-600 border-primary-100", href: "/dashboard/queue" },
  ],
  receptionist: [
    { title: "Book Walk-in", desc: "Register new arrivals", icon: "🚶", color: "bg-amber-50 text-amber-600 border-amber-100", href: "/dashboard/book" },
    { title: "Manage Queue", desc: "Override token flow", icon: "⚡", color: "bg-primary-50 text-primary-600 border-primary-100", href: "/dashboard/queue" },
  ],
  patient: [
    { title: "Book Visit", desc: "Schedule a consultation", icon: "📅", color: "bg-primary-50 text-primary-600 border-primary-100", href: "/dashboard/book" },
    { title: "Queue Position", desc: "Track live status", icon: "⏳", color: "bg-emerald-50 text-emerald-600 border-emerald-100", href: "/dashboard/queue" },
    { title: "Records", desc: "Consultation history", icon: "📜", color: "bg-blue-50 text-blue-600 border-blue-100", href: "/dashboard/records" },
  ],
};

const stats = [
  { label: "Today's Appointments", value: "8", icon: "📅", trend: "+2" },
  { label: "Active Queue", value: "3", icon: "📋", trend: "Normal" },
  { label: "Avg. Wait Time", value: "12m", icon: "⏱️", trend: "-5m" },
  { label: "Consultations", value: "24", icon: "✅", trend: "+12%" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) return null;

  const greeting = getGreeting();
  const actions = roleQuickActions[user.role] || roleQuickActions.patient;

  return (
    <div className="space-y-10 animate-fade-in text-surface-900 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-surface-950">
            {greeting}, <span className="text-primary-600">{user.full_name.split(" ")[0]}</span>
          </h1>
          <p className="text-surface-500 font-medium text-lg mt-1">
            System status: <span className="text-emerald-600 font-bold">Operational</span>. Check your daily metrics below.
          </p>
        </div>
        <div className="bg-white border border-surface-200 p-2 rounded-2xl flex gap-1 shadow-sm">
           <button className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-bold rounded-xl border border-primary-100">Daily View</button>
           <button className="px-4 py-2 hover:bg-surface-50 text-surface-500 text-sm font-bold rounded-xl transition-colors">Weekly</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="glass p-6 group hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</span>
              {stat.trend && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-surface-950 tracking-tight">{stat.value}</p>
            <p className="text-sm font-bold text-surface-400 mt-1 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black text-surface-950 tracking-tight">Portal Access</h2>
            <div className="flex-1 h-px bg-surface-200"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <button
              onClick={() => router.push(action.href)}
              key={action.title}
              className={`group glass p-8 text-left transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 border-2 border-transparent hover:border-primary-500/20 cursor-pointer flex flex-col justify-between h-48`}
            >
              <div className="flex justify-between items-start">
                 <span className="text-4xl">{action.icon}</span>
                 <svg className="w-6 h-6 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                 </svg>
              </div>
              <div>
                <h3 className={`text-xl font-black mb-1 group-hover:text-primary-600 transition-colors`}>
                  {action.title}
                </h3>
                <p className="text-sm font-medium text-surface-500 leading-relaxed">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
