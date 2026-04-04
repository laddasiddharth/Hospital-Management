"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Department {
  id: string;
  name: string;
  description: string | null;
  floor: number | null;
  is_active: boolean;
}

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    floor: "",
  });

  const fetchDepartments = async () => {
    try {
      const data = await api<Department[]>("/api/departments");
      setDepartments(data);
    } catch {
      setError("Failed to synchronize hospital wing data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/api/departments", {
        method: "POST",
        body: {
          name: form.name,
          description: form.description || null,
          floor: form.floor ? parseInt(form.floor) : null,
        },
      });
      setIsModalOpen(false);
      setForm({ name: "", description: "", floor: "" });
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to initialize clinical department.");
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-app"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10 animate-fade-in text-surface-900 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Hospital Departments</h1>
          <p className="text-surface-500 font-medium text-lg mt-1">Navigate the specialized wings and clinical wards.</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-500/20 px-8">+ Register Dept</Button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-2xl font-bold">
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, i) => (
          <div key={dept.id} className="glass p-8 group hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-2xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shadow-sm">
                🏢
              </div>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${dept.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-danger-50 text-danger-700 border-danger-100"}`}>
                {dept.is_active ? "Functional" : "Offline"}
              </span>
            </div>
            <h3 className="font-extrabold text-2xl text-surface-950 mb-3 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{dept.name}</h3>
            <p className="text-sm font-medium text-surface-500 mb-8 h-12 overflow-hidden line-clamp-2 leading-relaxed">{dept.description || "Establishment descriptive metadata not provided."}</p>
            
            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 gap-2 bg-surface-50 w-fit px-3 py-1.5 rounded-xl border border-surface-100">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
               Building Floor: {dept.floor || "G"}
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-24 text-center glass bg-white/50 border-dashed border-surface-200">
             <div className="text-5xl mb-4 grayscale opacity-30">🏢</div>
             <p className="text-surface-400 font-bold uppercase tracking-widest text-xs italic">No clinical departments registered</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-950/40 backdrop-blur-md animate-fade-in">
          <div className="glass p-10 w-full max-w-lg bg-white shadow-2xl relative overflow-hidden">
            <header className="mb-10 flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-black text-surface-950 tracking-tight">Register Department</h2>
                   <p className="text-surface-500 font-medium mt-1">Add a new clinical wing to the system.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Department Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Neurological Sciences"
              />
              <Input
                label="Clinical Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary of department focus"
              />
              <Input
                label="Floor Level"
                type="number"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                placeholder="e.g. 3"
              />
              <div className="flex gap-4 pt-8">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button" className="flex-1 py-4">Dismiss</Button>
                <Button type="submit" className="flex-1 py-4 shadow-xl shadow-primary-500/20">Initialize Wing</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
