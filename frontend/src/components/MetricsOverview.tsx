"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Cpu } from "lucide-react";

interface MetricsOverviewProps {
  overallAccuracy: number;
  worstGroupAccuracy: number;
}

export default function MetricsOverview({ overallAccuracy, worstGroupAccuracy }: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-400">Overall Accuracy</span>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-4xl font-extrabold text-slate-100">{(overallAccuracy * 100).toFixed(1)}%</p>
        <p className="text-xs text-slate-500 mt-2">Standard evaluation metric</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-6 bg-slate-900/60 border border-red-900/30 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-400">Worst-Group Accuracy (WGA)</span>
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-4xl font-extrabold text-red-400">{(worstGroupAccuracy * 100).toFixed(1)}%</p>
        <p className="text-xs text-red-400/70 mt-2">Performance gap under domain shift</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-400">Active Model</span>
          <Cpu className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-2xl font-bold text-slate-100">ResNet-50</p>
        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          weights: baseline_resnet50.pth
        </span>
      </motion.div>
    </div>
  );
}