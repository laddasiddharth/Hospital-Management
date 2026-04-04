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
    // Initial fetch could go here if we had an endpoint for just the board,
    // but we can rely entirely on WebSockets for real-time pushing for the demo.
    
    // Connect WebSocket
    const ws = new WebSocket("ws://localhost:8000/api/queue/ws");
    
    ws.onopen = () => {
        console.log("Connected to Live Queue Board WebSocket!");
    };
    
    ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.event === "STATE_UPDATE" || payload.event === "NEW_TOKEN") {
             const token = payload.data as LiveToken;
             
             if (token.status === "called") {
                 // Play chime!
                 try {
                     const audio = new Audio("https://cdn.freesound.org/previews/320/320181_527080-lq.mp3"); // Simple bell chime
                     audio.play().catch(() => {}); // Catch browser autoplay policies
                 } catch (e) {}

                 setRecentlyCalled(token);
                 setCalledTokens(prev => {
                     const filtered = prev.filter(t => t.id !== token.id);
                     return [token, ...filtered].slice(0, 5); // Keep last 5
                 });
                 
                 // Clear recently called after 10 seconds
                 setTimeout(() => {
                     setRecentlyCalled(null);
                 }, 10000);
             } else if (token.status === "completed" || token.status === "cancelled") {
                 // Remove from board if finished
                 setCalledTokens(prev => prev.filter(t => t.id !== token.id));
             }
        }
    };
    
    return () => {
        ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-app flex flex-col p-8 text-surface-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-surface-200 pb-6 relative z-10 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
             </svg>
           </div>
           <div>
             <h1 className="text-4xl font-extrabold tracking-tight text-surface-900">Smart Hospital</h1>
             <p className="text-xl text-surface-500 font-medium">Live Outpatient Queue</p>
           </div>
        </div>
        <div className="text-right">
           <h2 className="text-5xl font-bold font-mono text-surface-800">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </h2>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
         {/* Left Side: Currently Calling */}
         <div className="flex flex-col justify-center h-full">
            {recentlyCalled ? (
                <div className="bg-white border text-center animate-pulse-slow shadow-xl rounded-[3rem] p-16 border-primary-500">
                   <h3 className="text-2xl text-primary-600 font-bold uppercase tracking-widest mb-6">Proceed To Consultation</h3>
                   <div className="text-[8rem] font-black leading-none text-surface-950 tracking-tighter">
                      {recentlyCalled.token_number}
                   </div>
                   <div className="mt-8 px-6 py-3 bg-primary-50 text-primary-800 rounded-full inline-block font-bold text-lg border border-primary-100">
                      Doctor is ready for you
                   </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white border border-surface-200 rounded-[3rem] shadow-sm text-surface-400">
                   <svg className="w-24 h-24 mb-6 opacity-30 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-2xl font-medium">Waiting for next patient...</p>
                </div>
            )}
         </div>

         {/* Right Side: Previous Calls History */}
         <div className="flex flex-col">
            <h3 className="text-xl font-bold text-surface-500 mb-6 uppercase tracking-widest border-b border-surface-200 pb-3">Recent Calls</h3>
            <div className="space-y-4">
               {calledTokens.filter(t => t.id !== recentlyCalled?.id).map((token, i) => (
                  <div key={token.id} className="bg-white rounded-2xl p-6 flex justify-between items-center shadow-sm border border-surface-100" style={{ animationDelay: `${i * 100}ms` }}>
                     <div className="text-4xl font-extrabold text-surface-800 font-mono">
                        {token.token_number}
                     </div>
                     <div className="px-6 py-2 rounded-full bg-surface-50 border border-surface-200 text-surface-600 font-bold tracking-wide">
                        In Progress
                     </div>
                  </div>
               ))}
               
               {calledTokens.length === 0 && !recentlyCalled && (
                  <div className="py-12 border border-dashed border-surface-300 rounded-2xl text-center text-surface-500 text-lg bg-surface-50/50">
                     No patients called yet today.
                  </div>
               )}
            </div>
         </div>
      </main>

      {/* Footer Ticker */}
      <footer className="mt-12 bg-surface-900 text-white rounded-2xl py-4 overflow-hidden relative shadow-lg">
         <div className="whitespace-nowrap flex animate-[slide_30s_linear_infinite] group">
            <span className="text-surface-300 text-xl font-medium mx-8 tracking-wide">
               PLEASE HAVE YOUR IDs READY WHEN CALLED • DO NOT ENTER UNTIL YOUR TOKEN FLASHES • MAINTAIN SILENCE IN THE LOUNGE
            </span>
            <span className="text-surface-300 text-xl font-medium mx-8 tracking-wide">
               PLEASE HAVE YOUR IDs READY WHEN CALLED • DO NOT ENTER UNTIL YOUR TOKEN FLASHES • MAINTAIN SILENCE IN THE LOUNGE
            </span>
         </div>
      </footer>
    </div>
  );
}
