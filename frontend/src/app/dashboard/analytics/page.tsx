"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api(`/api/analytics/dashboard?days=${days}`);
        setData(res);
      } catch (err: any) {
        setError("Failed to fetch analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" || user?.role === "receptionist") {
      fetchAnalytics();
    }
  }, [days, user]);

  if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-slate-500">No data available</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">System performance and metrics</p>
        </div>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="border-slate-200 rounded-lg text-sm"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Tokens Processed</p>
          <p className="text-3xl font-bold text-slate-900">{data.summary.totalTokensProcessed}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Wait Time</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-blue-600">{data.summary.avgWaitTimeMinutes}</p>
            <p className="text-slate-500 font-medium">mins</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
             <p className="text-sm font-medium text-slate-500 mb-1">No-Show Rate</p>
             <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${data.summary.noShowRatePercent > 15 ? 'text-red-500' : 'text-emerald-500'}`}>{data.summary.noShowRatePercent}%</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Peak Time</p>
          <p className="text-xl font-bold text-indigo-600">{data.summary.peakHourLabel}</p>
        </div>
      </div>

      {/* Basic Hourly Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
         <h3 className="text-lg font-bold text-slate-800 mb-4">Hourly Token Activity (Daily Average over {days} days)</h3>
         <div className="h-64 flex items-end gap-2 overflow-x-auto pb-4">
            {data.hourlyData.length === 0 ? (
               <div className="h-full flex items-center justify-center w-full text-slate-400">No hourly data to display</div>
            ) : (
                data.hourlyData.map((hr: any) => {
                    const maxCount = Math.max(...data.hourlyData.map((d: any) => d.count), 1);
                    const heightPercent = ((hr.count / days) / (maxCount / days)) * 100;
                    return (
                        <div key={hr.hour} className="flex flex-col items-center gap-2 flex-shrink-0 w-12 group">
                             <div className="w-full bg-blue-50 relative rounded-t flex items-end group-hover:bg-blue-100 transition-colors" style={{ height: '200px' }}>
                                 <div 
                                    className="w-full bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors" 
                                    style={{ height: `${heightPercent}%` }}
                                 ></div>
                                 <div className="absolute -top-8 w-full text-center text-xs font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(hr.count / days).toFixed(1)}
                                 </div>
                             </div>
                             <span className="text-xs text-slate-500 whitespace-nowrap rotate-45 origin-left pt-2">{hr.hour}</span>
                        </div>
                    )
                })
            )}
         </div>
      </div>
    </div>
  );
}