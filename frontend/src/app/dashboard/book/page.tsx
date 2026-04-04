"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  user_id: string;
  department_id: string | null;
  specialization: string | null;
  consultation_duration_minutes: number;
  is_available: boolean;
}

interface User {
  id: string;
  full_name: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const [patientId, setPatientId] = useState<string>("");
  const [patients, setPatients] = useState<User[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [docsData, deptsData, adminUsersData] = await Promise.all([
          api<Doctor[]>("/api/doctors?is_available=true"),
          api<Department[]>("/api/departments"),
          currentUser?.role === 'admin' || currentUser?.role === 'receptionist' 
             ? api<User[]>("/api/admin/users") 
             : api<User[]>("/api/admin/users?role=doctor").catch(() => [])
        ]);
        
        setDoctors(docsData);
        setDepartments(deptsData);
        
        if (currentUser?.role === 'admin' || currentUser?.role === 'receptionist') {
             setUsers(adminUsersData);
             setPatients(adminUsersData.filter(u => u.role === 'patient'));
        } else {
             setUsers(adminUsersData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [currentUser]);

  const getDoctorName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? `Dr. ${u.full_name}` : "Clinical Specialist";
  };
  
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return "General Medicine";
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : "General Medicine";
  };

  const generateTimeSlots = (duration: number) => {
    const slots = [];
    let startHour = 9;
    let startMin = 0;
    while (startHour < 17) {
      const hStr = startHour.toString().padStart(2, '0');
      const mStr = startMin.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}:00`);
      startMin += duration;
      if (startMin >= 60) {
         startHour += Math.floor(startMin / 60);
         startMin = startMin % 60;
      }
    }
    return slots;
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setError("");
    try {
      const payload: any = {
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: selectedTime,
        notes: "Automated Clinical Booking"
      };
      if (currentUser?.role === 'receptionist' || currentUser?.role === 'admin') {
         if (!patientId) throw new Error("Please select a patient for this booking.");
         payload.patient_id = patientId;
      }
      await api("/api/appointments", { method: "POST", body: payload });
      router.push("/dashboard/appointments");
    } catch (e: any) {
      setError(e.message || "Failed to finalize booking.");
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const calendarDays = Array.from({length: 14}).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const filteredDoctors = selectedDept 
    ? doctors.filter(d => d.department_id === selectedDept)
    : doctors;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in text-surface-900 pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-surface-950">Schedule Consultation</h1>
        <p className="text-surface-500 font-medium text-lg mt-1">Select a specialist and preferred time slot.</p>
      </header>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-2xl font-bold flex items-center gap-3">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           {error}
        </div>
      )}

      {/* stepper */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 space-y-2">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary-600 shadow-sm' : 'bg-surface-200'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary-600' : 'text-surface-400'}`}>
              {s === 1 ? 'Specialist' : s === 2 ? 'Schedule' : 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      <div className="glass p-8 bg-white overflow-hidden">
        {step === 1 && (
          <div className="space-y-8 animate-slide-up">
            {(currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && (
               <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">🆔</div>
                  <div className="flex-1">
                    <label className="block text-xs font-black text-primary-700 uppercase tracking-widest mb-2">Assign Patient</label>
                    <select
                      className="w-full h-12 rounded-xl px-4 bg-white border border-primary-100 text-surface-900 font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    >
                      <option value="">Select a registered patient...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.id.split('-')[0]})</option>)}
                    </select>
                  </div>
               </div>
            )}
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button 
                 onClick={() => setSelectedDept(null)}
                 className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-sm font-black transition-all ${!selectedDept ? 'bg-primary-600 text-white shadow-lg' : 'bg-surface-50 text-surface-500 hover:bg-surface-100 border border-surface-100'}`}
              >
                All Departments
              </button>
              {departments.map(dept => (
                <button 
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-sm font-black transition-all ${selectedDept === dept.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-surface-50 text-surface-500 hover:bg-surface-100 border border-surface-100'}`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 group ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50/30' : 'border-surface-100 bg-surface-50/50 hover:border-primary-200 hover:bg-white hover:shadow-xl hover:shadow-primary-500/5'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform">🩺</div>
                    <div>
                      <h4 className="font-black text-surface-950 text-lg group-hover:text-primary-600 transition-colors uppercase tracking-tight">{getDoctorName(doc.user_id)}</h4>
                      <p className="text-primary-600 text-xs font-black uppercase tracking-widest">{doc.specialization || "General Medicine"}</p>
                      <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{getDeptName(doc.department_id)} • {doc.consultation_duration_minutes}m Slots</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="space-y-10 animate-slide-up">
            <header className="flex justify-between items-center bg-surface-50 p-6 rounded-3xl border border-surface-100">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">Booking for</p>
                  <p className="text-xl font-black text-surface-950">{getDoctorName(selectedDoctor.user_id)}</p>
               </div>
               <Button variant="secondary" onClick={() => setStep(1)} size="sm">Change Doctor</Button>
            </header>

            <section>
                <h3 className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] mb-6 pl-1">Available Dates</h3>
                <div className="grid grid-cols-7 gap-3">
                   {calendarDays.map((date, i) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateStr;
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      return (
                        <button
                          key={dateStr}
                          disabled={isWeekend}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${isWeekend ? 'opacity-20 cursor-not-allowed bg-surface-50' : isSelected ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/30' : 'bg-white text-surface-950 border-surface-100 hover:border-primary-300'}`}
                        >
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-primary-100' : 'text-surface-400'}`}>{date.toLocaleDateString("en-US", {weekday: 'short'})}</span>
                           <span className="text-2xl font-black mt-1">{date.getDate()}</span>
                        </button>
                      )
                   })}
                </div>
            </section>

            {selectedDate && (
               <section className="animate-slide-up">
                 <h3 className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] mb-6 pl-1">Preferred Time Slot</h3>
                 <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {generateTimeSlots(selectedDoctor.consultation_duration_minutes).map(time => (
                       <button
                         key={time}
                         onClick={() => setSelectedTime(time)}
                         className={`py-3 rounded-xl text-sm font-black transition-all border-2 ${selectedTime === time ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-white text-surface-500 border-surface-100 hover:border-primary-300'}`}
                       >
                         {time.slice(0, 5)}
                       </button>
                    ))}
                 </div>
               </section>
            )}
            
            <div className="flex justify-end pt-6">
              <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} size="lg" className="px-10 shadow-xl shadow-primary-500/20">Finalize Details</Button>
            </div>
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div className="animate-scale-in max-w-lg mx-auto text-center py-10 space-y-10">
            <div className="w-24 h-24 rounded-[2rem] bg-primary-600 text-white mx-auto flex items-center justify-center shadow-2xl shadow-primary-500/30 relative">
               <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-surface-950 tracking-tight">Review Booking</h2>
                <p className="text-surface-500 font-medium">Verify your clinical consultation details.</p>
            </div>
            
            <div className="bg-surface-50 rounded-[2.5rem] p-10 text-left border-2 border-surface-100 space-y-8">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">👨‍⚕️</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Specialist Physician</p>
                    <p className="text-xl font-black text-surface-950 uppercase tracking-tight">{getDoctorName(selectedDoctor.user_id)}</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8 pt-8 border-t border-surface-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">📅</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">Date</p>
                        <p className="text-surface-900 font-black">{new Date(selectedDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric'})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">⏱️</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">Time</p>
                        <p className="text-surface-900 font-black">{selectedTime.slice(0, 5)}</p>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1 py-4">Revision</Button>
              <Button onClick={handleBooking} isLoading={isSubmitting} className="flex-1 py-4 shadow-xl shadow-primary-500/30">Confirm Schedule</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
