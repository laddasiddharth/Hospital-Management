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
      setError("Failed to load data.");
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
      setError(err.message || "Failed to create doctor profile");
    }
  };

  const getDoctorName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? `Dr. ${u.full_name}` : "Unknown Doctor";
  };
  
  const getDeptName = (deptId: string | null) => {
    if (!deptId) return "Unassigned";
    const d = departments.find(d => d.id === deptId);
    return d ? d.name : "Unknown";
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Doctors Directory</h1>
          <p className="text-surface-400 text-sm mt-1">Hospital physicians and specialists.</p>
        </div>
        {currentUser?.role === "admin" && (
          <Button onClick={() => setIsModalOpen(true)}>+ Add Doctor Profile</Button>
        )}
      </div>

      {error && <div className="p-3 bg-danger-500/10 text-danger-400 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc, i) => (
          <div key={doc.id} className={`glass rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300 animate-slide-up stagger-${i+1}`} style={{opacity: 0, animationFillMode: "forwards"}}>
            <div className="flex items-start gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-xl shrink-0">
                 👨‍⚕️
               </div>
               <div>
                 <h3 className="font-semibold text-lg text-surface-100">{getDoctorName(doc.user_id)}</h3>
                 <p className="text-primary-400 text-sm font-medium">{doc.specialization || "General"}</p>
                 <p className="text-surface-400 text-xs mt-0.5">{getDeptName(doc.department_id)}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mt-4 p-3 bg-surface-900/50 rounded-xl">
               <div>
                  <p className="text-surface-500 text-xs">Experience</p>
                  <p className="font-medium text-surface-200">{doc.experience_years} Years</p>
               </div>
               <div>
                  <p className="text-surface-500 text-xs">Status</p>
                  <p className={`font-medium ${doc.is_available ? 'text-success-400' : 'text-danger-400'}`}>
                    {doc.is_available ? 'Available' : 'Unavailable'}
                  </p>
               </div>
            </div>
          </div>
        ))}
        {doctors.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center border border-dashed border-surface-700/50 rounded-2xl">
             <p className="text-surface-400">No doctors registered yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold text-surface-50 mb-4">Add Doctor Profile</h2>
            
            {users.length === 0 ? (
               <div className="p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl mb-4">
                  <p className="text-warning-400 text-sm">You must create a User account with the 'doctor' role first.</p>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-surface-300">Select Doctor User</label>
                    <select
                      className="w-full rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      value={form.user_id}
                      onChange={e => setForm({...form, user_id: e.target.value})}
                      required
                    >
                      <option value="">-- Choose User --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-surface-300">Select Department</label>
                    <select
                      className="w-full rounded-xl px-4 py-3 bg-surface-900/80 text-surface-100 border border-surface-700/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      value={form.department_id}
                      onChange={e => setForm({...form, department_id: e.target.value})}
                    >
                      <option value="">-- General / None --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
    
                  <Input
                    label="Specialization"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Neurologist"
                  />
                  <Input
                    label="Experience (Years)"
                    type="number"
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                  <div className="flex gap-3 justify-end mt-6">
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
            )}
            
            {users.length === 0 && (
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Close</Button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
