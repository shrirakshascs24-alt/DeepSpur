"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GroupMetric } from "@/types/metrics";

interface GroupChartProps {
  data: GroupMetric[];
}

export default function GroupChart({ data }: GroupChartProps) {
  return (
    <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl text-white">
      <h2 className="text-xl font-bold mb-4 text-slate-100">Subgroup Accuracy Breakdown</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
              itemStyle={{ color: '#f8fafc' }}
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
      </div>
    </div>
  );
}