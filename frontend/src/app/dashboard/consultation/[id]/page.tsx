"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TokenQueue {
  id: string;
  token_number: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  status: string;
}

export default function ConsultationRoom() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const tokenId = params.id as string;

  const [token, setToken] = useState<TokenQueue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    blood_pressure_sys: "",
    blood_pressure_dia: "",
    heart_rate_bpm: "",
    temperature_celsius: "",
    weight_kg: "",
    symptoms: "",
    diagnosis: "",
    prescription_notes: "",
    lab_tests_requested: "",
  });

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const data = await api<TokenQueue>(`/api/queue/${tokenId}`);
        setToken(data);
      } catch (e: any) {
        setError("Patient token not found. " + e.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (tokenId) fetchToken();
  }, [tokenId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
         symptoms: form.symptoms,
         diagnosis: form.diagnosis || null,
         prescription_notes: form.prescription_notes || null,
         lab_tests_requested: form.lab_tests_requested || null,
         blood_pressure_sys: form.blood_pressure_sys ? parseInt(form.blood_pressure_sys) : null,
         blood_pressure_dia: form.blood_pressure_dia ? parseInt(form.blood_pressure_dia) : null,
         heart_rate_bpm: form.heart_rate_bpm ? parseInt(form.heart_rate_bpm) : null,
         temperature_celsius: form.temperature_celsius ? parseFloat(form.temperature_celsius) : null,
         weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
         appointment_id: token.appointment_id || null, // Will be null if it's a pure walk-in
         patient_id: token.patient_id,
         doctor_id: token.doctor_id,
         token_id: token.id
      };

      await api("/api/records", {
        method: "POST",
        body: payload
      });
      
      // Navigate back to queue after concluding the consultation
      router.push("/dashboard/queue");
    } catch (e: any) {
       setError("Failed to save medical record: " + e.message);
       setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Consultation Room</h1>
          <p className="text-surface-400 text-sm mt-1">EHR recording for Token <strong className="text-primary-400">{token?.token_number}</strong></p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>Cancel & Go Back</Button>
      </div>

      {error && <div className="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 text-danger-400 rounded-xl">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Side: Vitals & Details */}
         <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-surface-800">
               <h2 className="text-lg font-bold text-surface-200 mb-4 border-b border-surface-800 pb-2">Patient Vitals</h2>
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="BP Systolic" 
                    type="number" 
                    placeholder="e.g. 120"
                    value={form.blood_pressure_sys}
                    onChange={(e) => setForm({...form, blood_pressure_sys: e.target.value})}
                  />
                  <Input 
                    label="BP Diastolic" 
                    type="number" 
                    placeholder="e.g. 80"
                    value={form.blood_pressure_dia}
                    onChange={(e) => setForm({...form, blood_pressure_dia: e.target.value})}
                  />
                  <Input 
                    label="Heart Rate" 
                    type="number" 
                    placeholder="BPM"
                    value={form.heart_rate_bpm}
                    onChange={(e) => setForm({...form, heart_rate_bpm: e.target.value})}
                  />
                  <Input 
                    label="Temp. (°C)" 
                    type="number" 
                    step="0.1"
                    placeholder="e.g. 37.0"
                    value={form.temperature_celsius}
                    onChange={(e) => setForm({...form, temperature_celsius: e.target.value})}
                  />
                  <div className="col-span-2">
                     <Input 
                       label="Weight (kg)" 
                       type="number" 
                       step="0.1"
                       placeholder="e.g. 70.5"
                       value={form.weight_kg}
                       onChange={(e) => setForm({...form, weight_kg: e.target.value})}
                     />
                  </div>
               </div>
            </div>
            
            <div className="glass rounded-xl p-4 bg-warning-500/10 border border-warning-500/20">
               <p className="text-xs text-warning-400 font-medium">
                  ⚠️ Note: Saving this record is immutable. You cannot edit it after completion. Please verify all details.
               </p>
            </div>
         </div>

         {/* Right Side: Clinical Notes */}
         <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 border border-surface-800 space-y-5">
               <h2 className="text-lg font-bold text-surface-200 mb-2 border-b border-surface-800 pb-2">Clinical Notes & Prescription</h2>
               
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-300">Symptoms *</label>
                  <textarea 
                     className="w-full h-24 rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none outline-none"
                     placeholder="Chief complaints..."
                     required
                     value={form.symptoms}
                     onChange={(e) => setForm({...form, symptoms: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-300">Diagnosis</label>
                  <input 
                     className="w-full rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                     placeholder="Primary diagnosis..."
                     value={form.diagnosis}
                     onChange={(e) => setForm({...form, diagnosis: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-300">Prescription / Medication Details</label>
                  <textarea 
                     className="w-full h-32 rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none outline-none font-mono text-sm"
                     placeholder="Rx: Paracetamol 500mg 1-0-1 for 3 days..."
                     value={form.prescription_notes}
                     onChange={(e) => setForm({...form, prescription_notes: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-300">Lab Tests Requested</label>
                  <input 
                     className="w-full rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                     placeholder="e.g. CBC, Lipid Profile"
                     value={form.lab_tests_requested}
                     onChange={(e) => setForm({...form, lab_tests_requested: e.target.value})}
                  />
               </div>

               <div className="pt-4 flex justify-end">
                 <Button type="submit" isLoading={isSubmitting} className="min-w-40 py-4 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Save Record & Complete
                 </Button>
               </div>
            </div>
         </div>
      </form>
    </div>
  );
}
