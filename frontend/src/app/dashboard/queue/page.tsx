"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

interface TokenQueue {
  id: string;
  token_number: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  priority: string;
  position: number;
}

export default function QueueManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tokens, setTokens] = useState<TokenQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const data = await api<TokenQueue[]>("/api/queue");
      setTokens(data);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    const ws = new WebSocket("ws://localhost:8000/api/queue/ws");
    ws.onmessage = (event) => {
       const payload = JSON.parse(event.data);
       if (["NEW_TOKEN", "STATE_UPDATE", "QUEUE_REORDER"].includes(payload.event)) {
           fetchQueue();
       }
    };
    return () => ws.close();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await api(`/api/queue/${id}/status`, {
      method: "PATCH",
      body: { status: newStatus }
    });
    fetchQueue();
  };

  const setEmergency = async (id: string) => {
    await api(`/api/queue/${id}/priority`, {
      method: "PATCH",
      body: { priority: "emergency" }
    });
    fetchQueue();
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const priorityWeight: Record<string, number> = { "emergency": 3, "priority": 2, "normal": 1 };
  
  const sortedTokens = [...tokens]
       .filter(t => t.status !== "completed" && t.status !== "cancelled")
       .sort((a, b) => {
           if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
               return priorityWeight[b.priority] - priorityWeight[a.priority];
           }
           return a.position - b.position;
       });

  const waitingTokens = sortedTokens.filter(t => t.status === "waiting");
  const activeTokens = sortedTokens.filter(t => ["called", "in_consultation"].includes(t.status));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-surface-900 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-surface-950">Queue Console</h1>
          <p className="text-surface-500 font-medium">Real-time outpatient flow management.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold shadow-sm">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
           </span>
           Live Stream Connected
        </div>
      </div>

      {activeTokens.length > 0 && (
         <div className="space-y-4">
            <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1">In Consultation</h2>
            <div className="grid gap-4">
               {activeTokens.map(token => (
                  <div key={token.id} className="glass p-8 border-2 border-primary-500 shadow-xl shadow-primary-500/10 flex justify-between items-center bg-white">
                     <div className="flex items-center gap-8">
                        <div className="text-6xl font-black text-primary-600 tracking-tighter">
                           {token.token_number}
                        </div>
                        <div className="space-y-2">
                           <div className="flex gap-2">
                              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                 {token.status.replace('_', ' ')}
                              </span>
                              {token.priority === 'emergency' && (
                                 <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-danger-50 text-danger-700 border border-danger-100 animate-pulse">
                                    Emergency
                                 </span>
                              )}
                           </div>
                           <p className="text-surface-400 font-bold text-xs uppercase tracking-tight">Patient: {token.patient_id.split('-')[0]}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <Button onClick={() => router.push(`/dashboard/consultation/${token.id}?token_id=${token.id}`)} variant="primary" className="shadow-lg shadow-primary-500/20">Enter Consultation Room</Button>
                        <Button onClick={() => updateStatus(token.id, "cancelled")} variant="secondary">Cancel Visit</Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1">Next in Queue ({waitingTokens.length})</h2>
        <div className="space-y-3">
           {waitingTokens.map((token, i) => (
               <div key={token.id} className="glass p-5 flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-xl bg-surface-50 text-surface-400 flex items-center justify-center font-black group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {i + 1}
                     </div>
                     <div>
                        <div className="text-2xl font-black text-surface-950 tracking-tight">{token.token_number}</div>
                        <div className="text-xs font-bold text-surface-400">Position {token.position}</div>
                     </div>
                     {token.priority === 'emergency' && (
                        <div className="ml-4 px-3 py-1 rounded-lg bg-danger-50 text-danger-700 text-[10px] font-black uppercase tracking-wider border border-danger-100">
                           🚨 Emergency Priority
                        </div>
                     )}
                  </div>
                  <div className="flex gap-2">
                     {user?.role === 'receptionist' && token.priority !== 'emergency' && (
                         <Button variant="secondary" onClick={() => setEmergency(token.id)}>Mark Emergency</Button>
                     )}
                     {(user?.role === 'doctor' || user?.role === 'admin') && i === 0 && (
                        <Button onClick={() => updateStatus(token.id, "called")} className="px-6 shadow-lg shadow-primary-500/20">
                           Call Patient
                        </Button>
                     )}
                  </div>
               </div>
           ))}
           {waitingTokens.length === 0 && !activeTokens.length && (
               <div className="py-24 text-center glass border-dashed border-surface-200 bg-white shadow-none">
                  <div className="text-5xl mb-4 grayscale opacity-40">☕</div>
                  <h3 className="text-xl font-black text-surface-950 tracking-tight">Queue Fully Processed</h3>
                  <p className="text-surface-500 font-medium max-w-sm mx-auto mt-2">There are no more patients waiting in the outpatient lounge.</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}
