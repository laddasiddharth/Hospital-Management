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

const statusColors: Record<string, string> = {
  scheduled: "bg-surface-800 text-surface-300 border-surface-700",
  confirmed: "bg-primary-500/20 text-primary-400 border-primary-500/30",
  in_progress: "bg-warning-500/20 text-warning-400 border-warning-500/30",
  completed: "bg-success-500/20 text-success-400 border-success-500/30",
  cancelled: "bg-danger-500/20 text-danger-400 border-danger-500/30",
  no_show: "bg-surface-800 text-surface-500 border-surface-700",
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

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Appointments</h1>
          <p className="text-surface-400 text-sm mt-1">
            {user?.role === 'patient' ? "Your upcoming and past consultations." : "Manage scheduled hospital appointments."}
          </p>
        </div>
        {(user?.role === 'patient' || user?.role === 'receptionist') && (
           <Button onClick={() => window.location.href = "/dashboard/book"}>+ Book New</Button>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-xl animate-slide-up border border-surface-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-900 border-b border-surface-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-surface-300">Date & Time</th>
                <th className="px-6 py-4 font-semibold text-surface-300">IDs (Patient / Doctor)</th>
                <th className="px-6 py-4 font-semibold text-surface-300">Status</th>
                <th className="px-6 py-4 font-semibold text-surface-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-surface-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-surface-100">{new Date(apt.appointment_date).toLocaleDateString()}</div>
                    <div className="text-surface-500 text-xs mt-0.5">{apt.start_time.slice(0, 5)}</div>
                  </td>
                  <td className="px-6 py-4 text-surface-400 text-xs font-mono">
                    <div className="mb-1 truncate w-32"><span className="text-surface-500">P:</span> {apt.patient_id.split('-')[0]}</div>
                    <div className="truncate w-32"><span className="text-surface-500">D:</span> {apt.doctor_id.split('-')[0]}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[apt.status] || statusColors.scheduled}`}>
                      {apt.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'no_show' && (
                       <>
                         {user?.role === 'patient' && (
                             <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-danger-400 hover:text-danger-300 font-medium text-xs transition-colors">Cancel</button>
                         )}
                         {(user?.role === 'doctor' || user?.role === 'receptionist') && (
                             <>
                                <button onClick={() => updateStatus(apt.id, 'confirmed')} className="text-primary-400 hover:text-primary-300 font-medium text-xs transition-colors">Confirm</button>
                                <button onClick={() => updateStatus(apt.id, 'completed')} className="text-success-400 hover:text-success-300 font-medium text-xs transition-colors">Complete</button>
                                <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-danger-400 hover:text-danger-300 font-medium text-xs transition-colors">Cancel</button>
                             </>
                         )}
                       </>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-surface-400 border-none">
                    No appointments found.
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
