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
      setError("Failed to load departments.");
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
      setError(err.message || "Failed to create department");
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Departments</h1>
          <p className="text-surface-400 text-sm mt-1">Manage hospital departments and locations.</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => setIsModalOpen(true)}>+ Add Department</Button>
        )}
      </div>

      {error && <div className="p-3 bg-danger-500/10 text-danger-400 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, i) => (
          <div key={dept.id} className={`glass rounded-2xl p-6 hover:border-primary-500/30 transition-all duration-300 animate-slide-up stagger-${i+1}`} style={{opacity: 0, animationFillMode: "forwards"}}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-surface-100">{dept.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${dept.is_active ? "bg-success-500/20 text-success-400" : "bg-danger-500/20 text-danger-400"}`}>
                {dept.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-surface-400 mb-4 h-10 overflow-hidden line-clamp-2">{dept.description || "No description provided."}</p>
            <div className="flex items-center text-xs text-surface-500 gap-1 font-medium bg-surface-900/50 w-fit px-2 py-1 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              Floor {dept.floor || "-"}
            </div>
          </div>
        ))}
        {departments.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center border border-dashed border-surface-700/50 rounded-2xl">
            <p className="text-surface-400">No departments found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold text-surface-50 mb-4">Add Department</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Department Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Cardiology"
              />
              <Input
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
              <Input
                label="Floor Number"
                type="number"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                placeholder="e.g. 2"
              />
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
