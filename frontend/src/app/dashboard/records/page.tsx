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
  respiratory_rate: number | null;
  spo2_percent: number | null;
  temperature_celsius: number | null;
  weight_kg: number | null;
  height_cm: number | null;
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

  const calculateBMI = (w: number | null, h: number | null) => {
    if (!w || !h) return null;
    const heightMeters = h / 100;
    return (w / (heightMeters * heightMeters)).toFixed(1);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-surface-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Medical History</h1>
          <p className="text-surface-500 font-medium mt-1">Access your health timeline and immutable clinical records.</p>
        </div>
        <div className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm text-surface-600 font-bold shadow-sm">
           {records.length} Records Documented
        </div>
      </div>

      <div className="space-y-4">
         {records.map((record) => (
             <div key={record.id} className="glass overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Header (Click to expand) */}
                <div 
                   onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                   className="p-6 cursor-pointer hover:bg-surface-50 flex justify-between items-center transition-colors"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black">
                         {new Date(record.created_at).getDate()}
                      </div>
                      <div>
                         <h3 className="font-extrabold text-lg text-surface-950">{record.diagnosis || "General Consultation"}</h3>
                         <p className="text-sm text-surface-500 font-medium">
                           {new Date(record.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} at {new Date(record.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {record.prescription_notes && (
                         <span className="hidden sm:inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase rounded-lg border border-emerald-100">
                            Prescription Attached
                         </span>
                      )}
                      <svg className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${expandedId === record.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                   </div>
                </div>

                {/* Expanded Details */}
                {expandedId === record.id && (
                   <div className="p-8 pt-0 border-t border-surface-100 bg-surface-50/30 animate-slide-up origin-top">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                         
                         {/* Vitals Sidebar */}
                         <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white border border-surface-200 p-5 rounded-2xl shadow-sm space-y-3">
                               <h4 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-4">Vitals Summary</h4>
                               
                               <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">BP (Sys/Dia)</span>
                                  <span className="font-bold text-surface-900">{record.blood_pressure_sys || '-'}/{record.blood_pressure_dia || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">Heart Rate</span>
                                  <span className="font-bold text-surface-900">{record.heart_rate_bpm ? `${record.heart_rate_bpm} bpm` : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">Resp. Rate</span>
                                  <span className="font-bold text-surface-900">{record.respiratory_rate ? `${record.respiratory_rate}/min` : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">SpO2</span>
                                  <span className="font-bold text-surface-900">{record.spo2_percent ? `${record.spo2_percent}%` : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">Temperature</span>
                                  <span className="font-bold text-surface-900">{record.temperature_celsius ? `${record.temperature_celsius} °C` : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-surface-50">
                                  <span className="text-surface-500 font-medium">Height/Weight</span>
                                  <span className="font-bold text-surface-900">{record.height_cm || '-'}/{record.weight_kg || '-'}</span>
                                </div>
                                {calculateBMI(record.weight_kg, record.height_cm) && (
                                  <div className="pt-2 flex justify-between items-center">
                                    <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded">BMI Score</span>
                                    <span className="font-black text-primary-700">{calculateBMI(record.weight_kg, record.height_cm)}</span>
                                  </div>
                                )}
                            </div>
                         </div>

                         {/* Records Content */}
                         <div className="lg:col-span-3 space-y-8">
                            <div>
                               <h4 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-3">Patient Complaints</h4>
                               <p className="text-surface-700 text-base leading-relaxed bg-white border border-surface-200 p-4 rounded-2xl shadow-sm">
                                  {record.symptoms}
                                </p>
                            </div>

                            {record.prescription_notes && (
                               <div>
                                  <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                     Electronic Prescription
                                  </h4>
                                  <div className="text-emerald-900 text-sm font-mono leading-relaxed bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 whitespace-pre-wrap shadow-sm">
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
             <div className="py-24 text-center glass bg-white border-dashed border-surface-300">
                <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
                <h3 className="text-xl font-black text-surface-950 tracking-tight">Timeline Empty</h3>
                <p className="text-surface-500 font-medium max-w-sm mx-auto mt-2">When you undergo a clinical consultation, your immutable records will appear here.</p>
             </div>
         )}
      </div>
    </div>
  );
}
