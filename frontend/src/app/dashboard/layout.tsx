"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-purple-50 text-purple-700 border-purple-100" },
  doctor: { label: "Doctor", color: "bg-blue-50 text-blue-700 border-blue-100" },
  receptionist: { label: "Receptionist", color: "bg-amber-50 text-amber-700 border-amber-100" },
  patient: { label: "Patient", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    roles: ["admin", "doctor", "receptionist", "patient"],
  },
  {
    label: "Medical History",
    href: "/dashboard/records",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: ["patient", "doctor"],
  },
  {
    label: "Live Queue",
    href: "/dashboard/queue",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    roles: ["admin", "doctor", "receptionist", "patient"],
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    roles: ["admin", "doctor", "receptionist", "patient"],
  },
  {
    label: "Physicians",
    href: "/dashboard/doctors",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    roles: ["admin", "patient"],
  },
  {
    label: "Book Appointment",
    href: "/dashboard/book",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    roles: ["patient", "receptionist"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: ["admin", "receptionist"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-app"><LoadingSpinner size="lg" /></div>;
  if (!user) return null;

  const roleInfo = roleLabels[user.role] || roleLabels.patient;
  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-app font-sans text-surface-900">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 z-30 flex flex-col border-r border-surface-200 bg-white shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-surface-100">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 transform group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-surface-950 text-sm leading-none tracking-tight">Smart Hospital</h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-surface-400 mt-1">Personnel Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-600 shadow-sm border border-primary-100"
                    : "text-surface-500 hover:text-surface-900 hover:bg-surface-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-surface-100 bg-surface-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-surface-950 truncate leading-tight">{user.full_name}</p>
              <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-surface-500 hover:text-danger-600 hover:bg-danger-50 transition-all cursor-pointer border border-transparent hover:border-danger-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Nav Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-surface-200 bg-white/80 backdrop-blur-md flex items-center px-8 justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-surface-400">
              {navItems.find((n) => n.href === pathname)?.label || "Dashboard Overview"}
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-surface-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
                <span className="border-l border-surface-200 h-4 mx-2"></span>
                {new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        </header>

        {/* Page Viewport */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
