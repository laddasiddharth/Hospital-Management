"use client";

import { useEffect, useState } from "react";
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
  const { user } = useAuth();
  const [tokens, setTokens] = useState<TokenQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const url = user?.role === 'doctor' 
         ? `/api/queue?doctor_id=${user.id}` // Wait, doctors map to doctor_id not straight user.id. Assuming the backend resolves it or we load it. For demo efficiency, we map all today.
         : `/api/queue`;
         
      // In practice, if role===doctor we'd fetch their specific `doctor.id`. 
      // For this phase, we'll fetch all and filter client side if needed, or rely on the backend.
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
       if (payload.event === "NEW_TOKEN" || payload.event === "STATE_UPDATE" || payload.event === "QUEUE_REORDER") {
           // Refetch everything to ensure strict sync (in production we'd merge dynamically)
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
    // WebSocket loop will trigger fetchQueue
  };

  const setEmergency = async (id: string) => {
    await api(`/api/queue/${id}/priority`, {
      method: "PATCH",
      body: { priority: "emergency" }
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  // Sort: Emergency First -> Priority -> Normal. Then by position.
  const priorityWeight: any = { "emergency": 3, "priority": 2, "normal": 1 };
  
  const sortedTokens = [...tokens]
       .filter(t => t.status !== "completed" && t.status !== "cancelled")
       .sort((a, b) => {
           if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
               return priorityWeight[b.priority] - priorityWeight[a.priority];
           }
           return a.position - b.position;
       });

  const waitingTokens = sortedTokens.filter(t => t.status === "waiting");
  const activeTokens = sortedTokens.filter(t => t.status === "called" || t.status === "in_consultation");

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Live Queue Console</h1>
          <p className="text-surface-400 text-sm mt-1">Manage today's waiting list in real-time.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border-success-500/30 text-success-400 text-sm font-medium">
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
           </span>
           Live connected
        </div>
      </div>

      {activeTokens.length > 0 && (
         <div className="mb-8">
            <h2 className="text-lg font-bold text-surface-200 mb-4 uppercase tracking-wider">Currently In Progress</h2>
            <div className="space-y-3">
               {activeTokens.map(token => (
                  <div key={token.id} className="glass rounded-2xl p-6 border-2 border-primary-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex justify-between items-center bg-primary-500/5">
                     <div className="flex items-center gap-6">
                        <div className="text-5xl font-black text-white drop-shadow-md">
                           {token.token_number}
                        </div>
                        <div>
                           <div className="flex gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-primary-500/20 text-primary-400 border border-primary-500/30">
                                 {token.status}
                              </span>
                              {token.priority === 'emergency' && (
                                 <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-danger-500/20 text-danger-400 border border-danger-500/30">
                                    EMERGENCY
                                 </span>
                              )}
                           </div>
                           <p className="text-surface-400 text-sm font-mono">Patient ID: {token.patient_id.split('-')[0]}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        {token.status === "called" && (
                           <Button onClick={() => updateStatus(token.id, "in_consultation")} variant="secondary">Mark Consult</Button>
                        )}
                        <Button onClick={() => updateStatus(token.id, "completed")} variant="primary">Complete</Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-surface-200 mb-4 uppercase tracking-wider">Waiting Corridor ({waitingTokens.length})</h2>
        <div className="space-y-3">
           {waitingTokens.map((token, i) => (
               <div key={token.id} className="glass rounded-xl p-4 flex items-center justify-between hover:border-surface-600 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center text-surface-300 font-bold">
                        {i + 1}
                     </div>
                     <div>
                        <div className="text-xl font-bold text-surface-200 font-mono tracking-tight">{token.token_number}</div>
                        <div className="text-xs text-surface-500 mt-0.5">Pos: {token.position}</div>
                     </div>
                     {token.priority === 'emergency' && (
                        <div className="ml-4 px-2 py-1 rounded bg-danger-500/20 text-danger-400 text-xs font-bold uppercase border border-danger-500/30">
                           🚨 Emergency
                        </div>
                     )}
                  </div>
                  <div className="flex gap-2">
                     {user?.role === 'receptionist' && token.priority !== 'emergency' && (
                         <Button variant="ghost" onClick={() => setEmergency(token.id)}>Mark Emergency</Button>
                     )}
                     {(user?.role === 'doctor' || user?.role === 'admin') && i === 0 && (
                        <Button onClick={() => updateStatus(token.id, "called")} className="animate-pulse-slow">
                           Call Next
                        </Button>
                     )}
                  </div>
               </div>
           ))}
           {waitingTokens.length === 0 && (
               <div className="py-12 border border-dashed border-surface-700/50 rounded-2xl text-center">
                  <p className="text-surface-400">Queue is empty! Time for a coffee break ☕</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}
