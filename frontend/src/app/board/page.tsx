"use client";

import { useEffect, useState } from "react";

interface LiveToken {
  id: string;
  token_number: string;
  status: string;
  doctor_id: string;
}

export default function LiveTVBoard() {
  const [calledTokens, setCalledTokens] = useState<LiveToken[]>([]);
  const [recentlyCalled, setRecentlyCalled] = useState<LiveToken | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/api/queue/ws");
    
    ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (["STATE_UPDATE", "NEW_TOKEN"].includes(payload.event)) {
             const token = payload.data as LiveToken;
             
             if (token.status === "called") {
                 try {
                     const audio = new Audio("https://cdn.freesound.org/previews/320/320181_527080-lq.mp3");
                     audio.play().catch(() => {});
                 } catch (e) {}

                 setRecentlyCalled(token);
                 setCalledTokens(prev => {
                     const filtered = prev.filter(t => t.id !== token.id);
                     return [token, ...filtered].slice(0, 5);
                 });
                 
                 setTimeout(() => setRecentlyCalled(null), 12000);
             } else if (["completed", "cancelled"].includes(token.status)) {
                 setCalledTokens(prev => prev.filter(t => t.id !== token.id));
             }
        }
    };
    
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-app flex flex-col p-12 text-surface-900 font-sans overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary-100/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-100/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-end mb-16 border-b-4 border-surface-200 pb-8 relative z-10">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 rounded-[2rem] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
           </div>
           <div>
              <h1 className="text-5xl font-black tracking-tight text-surface-950">Outpatient Status</h1>
              <p className="text-2xl text-surface-500 font-bold uppercase tracking-widest mt-1">Live Queue Management</p>
           </div>
        </div>
        <div className="text-right">
           <h2 className="text-6xl font-black tabular-nums text-primary-600">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </h2>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
         {/* Left Side: Priority Calling */}
         <div className="flex flex-col justify-center">
            {recentlyCalled ? (
                <div className="bg-white border-[6px] border-primary-500 rounded-[4rem] p-20 text-center animate-scale-in relative overflow-hidden shadow-2xl shadow-primary-500/20">
                   <div className="absolute top-0 inset-x-0 h-4 bg-primary-500 animate-pulse" />
                   <h3 className="text-4xl text-primary-700 font-black uppercase tracking-widest mb-8">Please Proceed</h3>
                   <div className="text-[12rem] font-black leading-none text-surface-950 tracking-tighter drop-shadow-sm flex items-center justify-center gap-4">
                      <span className="text-primary-600">#</span>{recentlyCalled.token_number}
                   </div>
                   <div className="mt-12 text-4xl font-bold text-surface-600">
                      Doctor is ready to see you.
                   </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-surface-300 bg-white/50 border-4 border-dashed border-surface-200 rounded-[4rem]">
                   <svg className="w-32 h-32 mb-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1.5m6-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-3xl font-black tracking-tight uppercase">Monitoring Queue...</p>
                </div>
            )}
         </div>

         {/* Right Side: Recently Called List */}
         <div className="flex flex-col">
            <h3 className="text-3xl font-black text-surface-400 mb-8 uppercase tracking-[0.2em] px-4">Called Tokens</h3>
            <div className="space-y-6">
               {calledTokens.filter(t => t.id !== recentlyCalled?.id).slice(0, 4).map((token, i) => (
                  <div key={token.id} className="bg-white rounded-3xl p-8 flex justify-between items-center border-2 border-surface-100 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-surface-50 text-surface-400 flex items-center justify-center text-2xl font-black">
                           {i + 1}
                        </div>
                        <div className="text-6xl font-black text-surface-900 tracking-tighter font-mono">
                           {token.token_number}
                        </div>
                     </div>
                     <div className="px-8 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl border border-emerald-100">
                        Consulting
                     </div>
                  </div>
               ))}
               
               {calledTokens.length === 0 && !recentlyCalled && (
                  <div className="py-20 bg-white/40 border-4 border-dotted border-surface-200 rounded-3xl text-center text-surface-400 text-2xl font-bold">
                     Waiting for active sessions...
                  </div>
               )}
            </div>
         </div>
      </main>

      {/* Footer Informational Ticker */}
      <footer className="mt-16 bg-surface-950 rounded-[2rem] py-6 overflow-hidden relative z-10 shadow-2xl">
         <div className="whitespace-nowrap flex animate-[slide_40s_linear_infinite] pause-on-hover">
            <span className="text-white text-2xl font-black mx-12 tracking-wide flex items-center gap-4">
               <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
               PLEASE HAVE YOUR REGISTRATION TOKEN READY • DO NOT ENTER THE CABIN UNTIL CALLED • MAINTAIN SILENCE
            </span>
            <span className="text-white text-2xl font-black mx-12 tracking-wide flex items-center gap-4">
               <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
               PLEASE HAVE YOUR REGISTRATION TOKEN READY • DO NOT ENTER THE CABIN UNTIL CALLED • MAINTAIN SILENCE
            </span>
         </div>
      </footer>

      <style jsx>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
