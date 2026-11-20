"use client";

import MetricsOverview from "../components/MetricsOverview";
import GroupChart from "../components/GroupChart";
import XaiViewer from "../components/XaiViewer";
import { Activity, Database, GitBranch } from "lucide-react";

const dummyData = {
  overallAccuracy: 0.885,
  worstGroupAccuracy: 0.428,
  groups: [
    { id: 0, name: "Land/Land", accuracy: 96.0, sampleCount: 1000 },
    { id: 1, name: "Land/Water", accuracy: 42.8, sampleCount: 150 },
    { id: 2, name: "Water/Land", accuracy: 48.3, sampleCount: 180 },
    { id: 3, name: "Water/Water", accuracy: 92.0, sampleCount: 800 },
  ],
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 leading-none">DeepSpur Platform</h1>
            <p className="text-xs text-slate-400 mt-1">Spurious Correlation Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Dataset: Waterbirds
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> Pipeline: Active
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <MetricsOverview 
          overallAccuracy={dummyData.overallAccuracy} 
          worstGroupAccuracy={dummyData.worstGroupAccuracy} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GroupChart data={dummyData.groups} />
          <XaiViewer />
        </div>
      </main>
    </div>
  );
}