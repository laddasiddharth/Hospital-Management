"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "receptionist",
  });

  const fetchData = async () => {
    try {
      if (currentUser?.role === "admin") {
        const usersData = await api<User[]>("/api/admin/users");
        setUsers(usersData.filter(u => u.role !== 'patient')); // Only show staff
      }
    } catch {
      setError("Failed to fetch staff records.");
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
      await api("/api/admin/users", {
        method: "POST",
        body: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
          role: form.role,
        },
      });
      setIsModalOpen(false);
      setForm({ full_name: "", email: "", phone: "", password: "", role: "receptionist" });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to create user account.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
       case 'admin': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin</span>;
       case 'doctor': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Doctor</span>;
       case 'receptionist': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Receptionist</span>;
       default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{role}</span>;
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-app"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-10 animate-fade-in text-surface-900 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Staff Management</h1>
          <p className="text-surface-500 font-medium text-lg mt-1">Administer hospital personnel accounts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-500/20 px-8">+ Add Staff Account</Button>
      </header>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-100 text-danger-700 rounded-2xl font-bold">
           {error}
        </div>
      )}

      {/* Staff Table */}
      <div className="glass rounded-2xl overflow-hidden bg-white shadow-sm border border-surface-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="p-4 font-black tracking-widest uppercase text-xs text-surface-500">Name</th>
              <th className="p-4 font-black tracking-widest uppercase text-xs text-surface-500">Email</th>
              <th className="p-4 font-black tracking-widest uppercase text-xs text-surface-500">Role</th>
              <th className="p-4 font-black tracking-widest uppercase text-xs text-surface-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-primary-50/50 transition-colors">
                <td className="p-4 font-bold text-surface-950">{u.full_name}</td>
                <td className="p-4 text-surface-500 font-medium text-sm">{u.email}</td>
                <td className="p-4">{getRoleBadge(u.role)}</td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-danger-500'}`}></div>
                       <span className="text-sm font-bold text-surface-500">{u.is_active ? 'Active' : 'Inactive'}</span>
                   </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-surface-400 font-bold italic">No staff found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-950/40 backdrop-blur-md animate-fade-in">
          <div className="glass p-10 w-full max-w-lg bg-white shadow-2xl relative overflow-hidden rounded-3xl">
            <header className="mb-8 flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-black text-surface-950 tracking-tight">Add Staff Account</h2>
                   <p className="text-surface-500 font-medium mt-1">Create a user login for healthcare staff.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div onClick={() => setForm({...form, role: 'receptionist'})} className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-colors ${form.role === 'receptionist' ? 'border-primary-500 bg-primary-50 text-primary-700 font-black' : 'border-surface-200 text-surface-500 font-bold hover:bg-surface-50'}`}>
                    <div className="text-2xl mb-1">👩‍💻</div>
                    Receptionist
                 </div>
                 <div onClick={() => setForm({...form, role: 'doctor'})} className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-colors ${form.role === 'doctor' ? 'border-primary-500 bg-primary-50 text-primary-700 font-black' : 'border-surface-200 text-surface-500 font-bold hover:bg-surface-50'}`}>
                    <div className="text-2xl mb-1">👨‍⚕️</div>
                    Doctor
                 </div>
              </div>

              <div className="space-y-2 mt-4">
                 <Input label="Full Name" type="text" placeholder="Jane Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
                 <Input label="Email" type="email" placeholder="jane@hospital.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                 <Input label="Temporary Password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                 <Input label="Phone (Optional)" type="tel" placeholder="+1..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full">Create Account</Button>
                {form.role === 'doctor' && (
                   <p className="text-xs text-center mt-3 text-surface-400 font-bold italic">Note: After creating this account, you must visit the <a href="/dashboard/doctors" className="underline text-primary-500">Physicians tab</a> to finish provisioning their medical profile.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}