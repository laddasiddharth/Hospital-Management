"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient: { full_name: string; email: string };
}

export default function ConsultationRoom() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenId = searchParams.get("token_id");
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Vitals State
  const [vitals, setVitals] = useState({
    blood_pressure_sys: "",
    blood_pressure_dia: "",
    heart_rate_bpm: "",
    respiratory_rate: "",
    spo2_percent: "",
    temperature_celsius: "",
    weight_kg: "",
    height_cm: "",
  });

  const [clinical, setClinical] = useState({
    symptoms: "",
    diagnosis: "",
    prescription_notes: "",
    lab_tests_requested: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api<Appointment>(`/api/appointments/${id}`);
        setAppointment(data);
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const calculateBMI = () => {
    const w = parseFloat(vitals.weight_kg);
    const h = parseFloat(vitals.height_cm) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return null;
  };

  const handleSave = async () => {
    if (!appointment) return;
    setIsSaving(true);

    try {
      await api("/api/records", {
        method: "POST",
        body: {
          appointment_id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          token_id: tokenId || undefined,
          ...vitals,
          ...clinical,
        },
      });
      setIsSaved(true);
      setTimeout(() => router.push("/dashboard/queue"), 2000);
    } catch (err) {
      alert("Failed to save record. Please check inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!appointment) return <div className="p-8 text-center text-surface-500">Appointment not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in text-surface-900">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Consultation Room</h1>
          <p className="text-surface-500 font-medium">Patient: <span className="text-primary-600">{appointment.patient.full_name}</span></p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          {!isSaved && (
            <Button onClick={handleSave} isLoading={isSaving} className="px-8 shadow-lg shadow-primary-500/20">
              Save Immutable Record
            </Button>
          )}
        </div>
      </header>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl animate-scale-in flex items-center gap-4">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
           <p className="font-bold text-lg">Record Saved Permanently. Closing consultation...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Vitals Panel */}
        <section className="lg:col-span-1 space-y-6">
          <div className="glass p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-surface-950">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Patient Vitals
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="BP (Sys)" type="number" value={vitals.blood_pressure_sys} onChange={e => setVitals({...vitals, blood_pressure_sys: e.target.value})} disabled={isSaved} />
              <Input label="BP (Dia)" type="number" value={vitals.blood_pressure_dia} onChange={e => setVitals({...vitals, blood_pressure_dia: e.target.value})} disabled={isSaved} />
              <Input label="Heart Rate" type="number" value={vitals.heart_rate_bpm} onChange={e => setVitals({...vitals, heart_rate_bpm: e.target.value})} disabled={isSaved} />
              <Input label="Resp. Rate" type="number" value={vitals.respiratory_rate} onChange={e => setVitals({...vitals, respiratory_rate: e.target.value})} disabled={isSaved} />
              <Input label="SpO2 (%)" type="number" value={vitals.spo2_percent} onChange={e => setVitals({...vitals, spo2_percent: e.target.value})} disabled={isSaved} />
              <Input label="Temp (°C)" type="number" step="0.1" value={vitals.temperature_celsius} onChange={e => setVitals({...vitals, temperature_celsius: e.target.value})} disabled={isSaved} />
              <Input label="Height (cm)" type="number" value={vitals.height_cm} onChange={e => setVitals({...vitals, height_cm: e.target.value})} disabled={isSaved} />
              <Input label="Weight (kg)" type="number" value={vitals.weight_kg} onChange={e => setVitals({...vitals, weight_kg: e.target.value})} disabled={isSaved} />
            </div>

            {calculateBMI() && (
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex justify-between items-center">
                <span className="font-bold text-primary-800">Calculated BMI</span>
                <span className="text-2xl font-black text-primary-600 font-mono">{calculateBMI()}</span>
              </div>
            )}
          </div>
        </section>

        {/* Right: Clinical Information */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass p-8 space-y-6 flex flex-col h-full">
            <h2 className="text-xl font-bold flex items-center gap-2 text-surface-950">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Clinical Records
            </h2>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Chief Complaints / Symptoms</label>
                <textarea 
                  className="w-full h-32 rounded-xl bg-surface-50 border border-surface-200 p-4 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  value={clinical.symptoms}
                  onChange={e => setClinical({...clinical, symptoms: e.target.value})}
                  disabled={isSaved}
                  placeholder="Describe patient symptoms..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">Diagnosis</label>
                    <textarea 
                      className="w-full h-40 rounded-xl bg-surface-50 border border-surface-200 p-4 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      value={clinical.diagnosis}
                      onChange={e => setClinical({...clinical, diagnosis: e.target.value})}
                      disabled={isSaved}
                      placeholder="Enter clinical diagnosis..."
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-surface-700 mb-2">Prescription & Medications</label>
                    <textarea 
                      className="w-full h-40 rounded-xl bg-surface-50 border border-surface-200 p-4 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-mono text-sm"
                      value={clinical.prescription_notes}
                      onChange={e => setClinical({...clinical, prescription_notes: e.target.value})}
                      disabled={isSaved}
                      placeholder="List drugs and frequency..."
                    />
                 </div>
              </div>

              <div>
                <Input label="Laboratory Tests Requested" type="text" value={clinical.lab_tests_requested} onChange={e => setClinical({...clinical, lab_tests_requested: e.target.value})} disabled={isSaved} placeholder="Blood Count, MRI, etc." />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
