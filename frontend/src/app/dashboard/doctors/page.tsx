"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Doctor {
  id: string;
  user_id: string;
  department_id: string | null;
  specialization: string | null;
  qualification: string | null;
  experience_years: number;
  is_available: boolean;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
}

export default function DoctorsPage() {
  const { user: currentUser } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    department_id: "",
    specialization: "",
    qualification: "",
    experience_years: 0,
  });

  const fetchData = async () => {
    try {
      const [docsData, deptsData] = await Promise.all([
        api<Doctor[]>("/api/doctors"),
        api<Department[]>("/api/departments")
      ]);
      setDoctors(docsData);
      setDepartments(deptsData);
      
      if (currentUser?.role === "admin") {
        const usersData = await api<User[]>("/api/admin/users?role=doctor");
        setUsers(usersData);
      }
    } catch {
      setError("Failed to synchronize physician records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/doctors", {
        method: "POST",
        body: {
          user_id: form.user_id,
          department_id: form.department_id || null,
          specialization: form.specialization || null,
          qualification: form.qualification || null,
          experience_years: form.experience_years,
        },
      });
      setIsModalOpen(false);
      setForm({ user_id: "", department_id: "", specialization: "", qualification: "", experience_years: 0 });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to initialize physician profile.");
    }
  };

  const getDoctorName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? `Dr. ${u.full_name}` : "Clinical Specialist";
  };
  
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return "General Outpatient";
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : "Unknown Department";
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-app"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10 animate-fade-in text-surface-900 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Physician Directory</h1>
          <p className="text-surface-500 font-medium text-lg mt-1">Access the hierarchy of specialized medical personnel.</p>
        </div>
        {currentUser?.role === "admin" && (
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-500/20 px-8">+ Provision Profile</Button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-2xl font-bold">
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc, i) => (
          <div key={doc.id} className="glass p-8 group hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-primary-50 text-3xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shadow-sm">
                 👨‍⚕️
               </div>
               <div>
                 <h3 className="font-black text-xl text-surface-950 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{getDoctorName(doc.user_id)}</h3>
                 <p className="text-primary-600 text-[10px] font-black uppercase tracking-widest">{doc.specialization || "General Medicine"}</p>
                 <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{getDeptName(doc.department_id)}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Clinical Exp</p>
                  <p className="font-black text-surface-950">{doc.experience_years} Years</p>
               </div>
               <div className={`p-4 rounded-2xl border-2 flex flex-col justify-center ${doc.is_available ? 'bg-emerald-50 border-emerald-100' : 'bg-surface-50 border-surface-100'}`}>
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Session Availability</p>
                  <p className={`font-black uppercase text-xs ${doc.is_available ? 'text-emerald-700' : 'text-surface-400 italic'}`}>
                    {doc.is_available ? 'Online' : 'Unavailable'}
                  </p>
               </div>
            </div>
          </div>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full py-24 text-center glass bg-white/50 border-dashed border-surface-200">
             <div className="text-5xl mb-4 grayscale opacity-30">🩺</div>
             <p className="text-surface-400 font-bold uppercase tracking-widest text-xs italic">No physicians currently provisioned</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-950/40 backdrop-blur-md animate-fade-in">
          <div className="glass p-10 w-full max-w-lg bg-white shadow-2xl relative overflow-hidden">
            <header className="mb-8 flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-black text-surface-950 tracking-tight">Provision Physician</h2>
                   <p className="text-surface-500 font-medium mt-1">Create a new professional profile.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            {users.length === 0 ? (
               <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl mb-8">
                  <p className="text-amber-800 text-sm font-bold leading-relaxed">No users found with the 'doctor' role. Please ask an Admin to go to the <a href="/api/docs" target="_blank" className="underline">Backend API</a> or use Admin tools to register a User account with a 'doctor' role before provisioning a profile here.</p>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1">Associate Account</label>
                    <select
                      className="w-full h-14 rounded-2xl px-5 bg-surface-50 border border-surface-200 text-surface-900 font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      value={form.user_id}
                      onChange={e => setForm({...form, user_id: e.target.value})}
                      required
                    >
                      <option value="">Select Doctor User...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1">Placement Department</label>
                    <select
                      className="w-full h-14 rounded-2xl px-5 bg-surface-50 border border-surface-200 text-surface-900 font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      value={form.department_id}
                      onChange={e => setForm({...form, department_id: e.target.value})}
                    >
                      <option value="">General OPD / None</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
    
                  <Input
                    label="Specialization Field"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Cardiologist"
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                  <div className="flex gap-4 pt-6">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button" className="flex-1 py-4">Dismiss</Button>
                    <Button type="submit" className="flex-1 py-4 shadow-xl shadow-primary-500/20">Finalize Profile</Button>
                  </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
