"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  status: string;
}

const statusStyles: Record<string, string> = {
  scheduled: "bg-surface-50 text-surface-600 border-surface-100",
  confirmed: "bg-primary-50 text-primary-700 border-primary-100",
  in_progress: "bg-amber-50 text-amber-700 border-amber-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-danger-50 text-danger-700 border-danger-100",
  no_show: "bg-surface-100 text-surface-400 border-surface-200",
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await api<Appointment[]>("/api/appointments");
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: { status: newStatus }
      });
      fetchAppointments();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-app"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-fade-in text-surface-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Appointments</h1>
          <p className="text-surface-500 font-medium mt-1">
            {user?.role === 'patient' ? "Manage your upcoming clinical visits." : "System-wide appointment coordination."}
          </p>
        </div>
        {(user?.role === 'patient' || user?.role === 'receptionist') && (
           <Button onClick={() => window.location.href = "/dashboard/book"} className="shadow-lg shadow-primary-500/20">
             + Book New Schedule
           </Button>
        )}
      </div>

      <div className="glass overflow-hidden shadow-xl shadow-surface-900/5 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-surface-400">Date & Time</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-surface-400">Identifiers</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-surface-400">Status</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-surface-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-surface-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-extrabold text-surface-950 text-base">{new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-surface-500 font-bold text-xs mt-1 tabular-nums">{apt.start_time.slice(0, 5)}</div>
                  </td>
                  <td className="px-6 py-5 font-mono text-[11px] font-bold text-surface-500">
                    <div className="mb-1 flex items-center gap-2"><span className="text-[10px] bg-surface-100 px-1 rounded text-surface-400">P</span> {apt.patient_id.split('-')[0]}</div>
                    <div className="flex items-center gap-2"><span className="text-[10px] bg-surface-100 px-1 rounded text-surface-400">D</span> {apt.doctor_id.split('-')[0]}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${statusStyles[apt.status] || statusStyles.scheduled}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-1">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'no_show' && (
                       <div className="flex justify-end gap-2">
                         {user?.role === 'patient' && (
                             <Button onClick={() => updateStatus(apt.id, 'cancelled')} variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50 border-danger-100">Cancel</Button>
                         )}
                         {(user?.role === 'doctor' || user?.role === 'receptionist') && (
                             <>
                                <Button onClick={() => updateStatus(apt.id, 'confirmed')} size="sm" variant="secondary" className="border-primary-200">Confirm</Button>
                                <Button onClick={() => updateStatus(apt.id, 'completed')} size="sm" className="bg-emerald-600 border-emerald-500">Complete</Button>
                                <Button onClick={() => updateStatus(apt.id, 'cancelled')} variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50">Cancel</Button>
                             </>
                         )}
                       </div>
                    )}
                    {(apt.status === 'completed' || apt.status === 'cancelled') && (
                      <span className="text-surface-300 font-bold text-[10px] uppercase tracking-widest italic pr-2">Archived Record</span>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center border-none">
                    <div className="text-5xl mb-4 grayscale opacity-30">📅</div>
                    <p className="text-surface-400 font-bold uppercase tracking-widest text-xs italic">No scheduled consultations found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
