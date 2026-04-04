"use client";

import { useEffect, useState, FormEvent } from "react";
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
  
  // Only for Receptionist
  const [patientId, setPatientId] = useState<string>("");
  const [patients, setPatients] = useState<User[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [docsData, deptsData, adminUsersData] = await Promise.all([
          api<Doctor[]>("/api/doctors?is_available=true"),
          api<Department[]>("/api/departments"),
          // Fetch users if we need to display doctor names or if receptionist needs to select patient
          currentUser?.role === 'admin' || currentUser?.role === 'receptionist' 
             ? api<User[]>("/api/admin/users") 
             : api<User[]>("/api/admin/users?role=doctor").catch(() => []) 
             // Workaround: In a real app we'd need a public endpoint for doctor names, 
             // but we'll simulate it for now.
        ]);
        
        setDoctors(docsData);
        setDepartments(deptsData);
        
        if (currentUser?.role === 'admin' || currentUser?.role === 'receptionist') {
             setUsers(adminUsersData);
             setPatients(adminUsersData.filter(u => u.role === 'patient'));
        }
      } catch (e) {
        // Ignoring fetch errors for users table for patients since they don't have admin access.
        // In a real app, doctor names would be included in the public /api/doctors route.
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [currentUser]);

  const getDoctorName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? `Dr. ${u.full_name}` : "Available Doctor";
  };
  
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return "General";
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : "General";
  };

  // Generate simple time slots
  const generateTimeSlots = (duration: number) => {
    const slots = [];
    let startHour = 9;
    let startMin = 0;
    
    while (startHour < 17) { // 9 AM to 5 PM
      const formattedHour = startHour.toString().padStart(2, '0');
      const formattedMin = startMin.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMin}:00`);
      
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
        end_time: selectedTime, // Simplified
        notes: "Booked via Calendar"
      };
      
      if (currentUser?.role === 'receptionist' || currentUser?.role === 'admin') {
         if (!patientId) {
             throw new Error("Must select a patient");
         }
         payload.patient_id = patientId;
      }

      await api("/api/appointments", {
        method: "POST",
        body: payload
      });
      
      router.push("/dashboard/appointments");
    } catch (e: any) {
      setError(e.message || "Failed to book appointment");
      setIsSubmitting(false);
    }
  };

  // Generate next 14 days for calendar
  const today = new Date();
  const calendarDays = Array.from({length: 14}).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
  });

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  const filteredDoctors = selectedDept 
    ? doctors.filter(d => d.department_id === selectedDept)
    : doctors;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-50">Book an Appointment</h1>
        <p className="text-surface-400 text-sm mt-1">Schedule a consultation with our specialists.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-danger-500/10 text-danger-400 rounded-xl">{error}</div>}

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex flex-col gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-surface-800'}`} />
            <span className={`text-xs font-medium ${step >= s ? 'text-primary-400' : 'text-surface-500'}`}>
              {s === 1 ? 'Select Doctor' : s === 2 ? 'Choose Time' : 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            {(currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && (
               <div className="mb-6 p-4 bg-surface-900/50 rounded-xl border border-surface-700/50">
                  <label className="block text-sm font-medium text-surface-300 mb-2">Select Patient (Receptionist/Admin Mode)</label>
                  <select
                    className="w-full rounded-xl px-4 py-3 bg-surface-900 text-surface-100 border border-surface-700 focus:border-primary-500 outline-none"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
               </div>
            )}
            
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              <button 
                 onClick={() => setSelectedDept(null)}
                 className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${!selectedDept ? 'bg-primary-500 text-white shadow-lg' : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}`}
              >
                All Departments
              </button>
              {departments.map(dept => (
                <button 
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${selectedDept === dept.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-surface-800 text-surface-300 hover:bg-surface-700'}`}
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
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-500/10' : 'border-surface-700/50 bg-surface-900/50 hover:border-surface-600'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center text-xl shadow-inner border border-surface-700 group-hover:border-primary-500/30">
                      👨‍⚕️
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-100">{getDoctorName(doc.user_id)}</h4>
                      <p className="text-primary-400 text-xs font-medium">{doc.specialization || "General"}</p>
                      <p className="text-surface-500 text-xs mt-0.5">{getDeptName(doc.department_id)} • {doc.consultation_duration_minutes} min slots</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                 <p className="text-surface-400 py-8 text-center col-span-full">No available doctors found in this department.</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="space-y-6 animate-slide-up">
            <h3 className="text-lg font-medium text-surface-200">Select Date</h3>
            <div className="grid grid-cols-7 gap-2">
               {calendarDays.map((date, i) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <button
                      key={dateStr}
                      disabled={isWeekend}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isWeekend ? 'opacity-30 cursor-not-allowed bg-surface-900 border-surface-800' : isSelected ? 'bg-primary-500 text-white border-primary-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transform scale-105' : 'bg-surface-800 text-surface-300 border-surface-700 hover:bg-surface-700'}`}
                    >
                       <span className="text-xs uppercase font-medium">{date.toLocaleDateString("en-US", {weekday: 'short'})}</span>
                       <span className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-surface-100'}`}>{date.getDate()}</span>
                    </button>
                  )
               })}
            </div>

            {selectedDate && (
               <div className="pt-6 border-t border-surface-800">
                 <h3 className="text-lg font-medium text-surface-200 mb-4">Available Times</h3>
                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {generateTimeSlots(selectedDoctor.consultation_duration_minutes).map(time => (
                       <button
                         key={time}
                         onClick={() => setSelectedTime(time)}
                         className={`py-2 rounded-lg text-sm font-medium transition-all border ${selectedTime === time ? 'bg-accent-500 text-white border-accent-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105' : 'bg-surface-900 text-surface-300 border-surface-700/50 hover:bg-surface-800 hover:text-surface-200'}`}
                       >
                         {time.slice(0, 5)}
                       </button>
                    ))}
                 </div>
               </div>
            )}
            
            <div className="flex justify-between pt-6">
              <Button variant="secondary" onClick={() => { setStep(1); setSelectedTime(""); setSelectedDate(""); }}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div className="animate-slide-up max-w-md mx-auto text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-6">
               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
               </svg>
            </div>
            <h2 className="text-xl font-bold text-surface-50 mb-2">Confirm Booking</h2>
            <div className="bg-surface-900/50 rounded-2xl p-6 text-left border border-surface-800 mb-8 space-y-4">
               <div>
                  <p className="text-xs text-surface-500 uppercase font-bold tracking-wider">Physician</p>
                  <p className="text-surface-100 font-medium">{getDoctorName(selectedDoctor.user_id)}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-surface-500 uppercase font-bold tracking-wider">Date</p>
                    <p className="text-surface-100 font-medium">{new Date(selectedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 uppercase font-bold tracking-wider">Time</p>
                    <p className="text-surface-100 font-medium">{selectedTime.slice(0, 5)}</p>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" onClick={() => setStep(2)}>Go Back</Button>
              <Button onClick={handleBooking} isLoading={isSubmitting}>Confirm & Book</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
