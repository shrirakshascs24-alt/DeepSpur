"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Layers, AlertCircle } from "lucide-react";

export default function XaiViewer() {
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" /> Explainable AI (Grad-CAM)
          </h2>
          <p className="text-sm text-slate-400">Inspecting spurious background activations</p>
        </div>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-2"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          {showHeatmap ? "Hide Overlay" : "Show Overlay"}
        </button>
      </div>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 opacity-80" />
        
        <div className="relative z-10 text-center p-6">
          <p className="text-slate-300 font-medium mb-1">Sample ID: #WB-8492 (Landbird on Water)</p>
          <p className="text-xs text-slate-500 mb-4 font-mono">Layer: ResNet-50 layer4[-1]</p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" /> Spurious Shortcut: Water Texture Attention
          </div>
        </div>

        {showHeatmap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-transparent pointer-events-none mix-blend-color-dodge"
          />
        )}
      </div>
    </div>
  );
}