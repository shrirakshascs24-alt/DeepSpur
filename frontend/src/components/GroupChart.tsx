"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GroupMetric } from "@/types/metrics";

interface GroupChartProps {
  data?: GroupMetric[] | null;
  isLoading?: boolean;
}

export default function GroupChart({ data, isLoading = false }: GroupChartProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100">Subgroup Accuracy Breakdown</h2>
        {hasData && (
          <span className="text-xs font-mono text-slate-400">
            {data.length} Subgroups Evaluated
          </span>
        )}
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {isLoading ? (
          <div className="text-sm font-mono text-slate-400 animate-pulse">
            Loading subgroup metrics...
          </div>
        ) : !hasData ? (
          <div className="text-sm font-mono text-slate-500">
            Subgroup metrics not available from backend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: any) => [`${value}%`, "Accuracy"]}
              />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.accuracy < 50 ? "#ef4444" : "#3b82f6"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
