"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MedicalRecord {
  id: string;
  created_at: string;
  symptoms: string;
  diagnosis: string | null;
  prescription_notes: string | null;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  heart_rate_bpm: number | null;
  temperature_celsius: number | null;
  weight_kg: number | null;
}

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await api<MedicalRecord[]>("/api/records");
        setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Medical History</h1>
          <p className="text-surface-400 text-sm mt-1">Review your past consultation records and digital prescriptions.</p>
        </div>
        <div className="px-4 py-2 glass rounded-lg text-sm text-surface-300 font-medium border border-surface-800">
           {records.length} Records Found
        </div>
      </div>

      <div className="space-y-4">
         {records.map((record) => (
             <div key={record.id} className="glass rounded-2xl overflow-hidden border border-surface-800 transition-all">
                {/* Header (Click to expand) */}
                <div 
                   onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                   className="p-6 cursor-pointer hover:bg-surface-800/30 flex justify-between items-center transition-colors"
                >
                   <div>
                      <h3 className="font-bold text-lg text-surface-200">{record.diagnosis || "General Consultation"}</h3>
                      <p className="text-sm text-surface-400 mt-1">{new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString()}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      {record.prescription_notes && (
                         <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold uppercase rounded-full border border-primary-500/30">
                            Rx Attached
                         </span>
                      )}
                      <svg className={`w-5 h-5 text-surface-400 transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                   </div>
                </div>

                {/* Expanded Details */}
                {expandedId === record.id && (
                   <div className="p-6 pt-0 border-t border-surface-800/50 bg-surface-900/30 animate-slide-up origin-top">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                         
                         {/* Vitals Sidebar */}
                         <div className="col-span-1 glass !bg-surface-900/50 p-4 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Recorded Vitals</h4>
                            <div className="flex justify-between text-sm">
                               <span className="text-surface-400">Blood Pressure</span>
                               <span className="font-medium text-surface-200">{record.blood_pressure_sys || '-'}/{record.blood_pressure_dia || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-surface-400">Heart Rate</span>
                               <span className="font-medium text-surface-200">{record.heart_rate_bpm ? `${record.heart_rate_bpm} bpm` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-surface-400">Temperature</span>
                               <span className="font-medium text-surface-200">{record.temperature_celsius ? `${record.temperature_celsius} °C` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-surface-400">Weight</span>
                               <span className="font-medium text-surface-200">{record.weight_kg ? `${record.weight_kg} kg` : '-'}</span>
                            </div>
                         </div>

                         {/* Rest of info */}
                         <div className="col-span-1 md:col-span-2 space-y-6">
                            <div>
                               <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Reported Symptoms</h4>
                               <p className="text-surface-300 text-sm leading-relaxed bg-surface-900/40 p-3 rounded-xl border border-surface-800/50">
                                  {record.symptoms}
                               </p>
                            </div>

                            {record.prescription_notes && (
                               <div>
                                  <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                     Digital Prescription
                                  </h4>
                                  <div className="text-primary-100 text-sm font-mono leading-relaxed bg-primary-950/20 p-4 rounded-xl border border-primary-500/20 whitespace-pre-wrap">
                                     {record.prescription_notes}
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}
             </div>
         ))}
         {records.length === 0 && (
             <div className="py-12 text-center glass rounded-2xl border border-dashed border-surface-700/50">
                <div className="text-4xl mb-4">🩺</div>
                <h3 className="text-lg font-medium text-surface-200">No medical history found</h3>
                <p className="text-surface-500 mt-1">When you visit a doctor, your reports will appear here.</p>
             </div>
         )}
      </div>
    </div>
  );
}
