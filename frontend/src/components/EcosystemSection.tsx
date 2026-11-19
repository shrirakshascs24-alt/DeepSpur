"use client";

import React, { useState } from "react";
import Magnet from "./Magnet";
import { Activity, ShieldAlert, Cpu, BarChart3, Sliders, AlertTriangle, ArrowUpRight, Zap, Target } from "lucide-react";

export default function EcosystemSection() {
  const [activeStrategy, setActiveStrategy] = useState("dro");

  const strategies = [
    { id: "erm", name: "Standard ERM", overall: "94.6%", worst: "42.8%", gap: "51.8%" },
    { id: "subsample", name: "Subsampling", overall: "89.2%", worst: "76.4%", gap: "12.8%" },
    { id: "dro", name: "Group DRO", overall: "91.8%", worst: "89.1%", gap: "2.7%" },
    { id: "jtt", name: "Just Train Twice", overall: "92.3%", worst: "86.5%", gap: "5.8%" },
  ];

  const currentStrategy = strategies.find((s) => s.id === activeStrategy) || strategies[2];

  return (
    <section id="ecosystem" className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>Diagnostic Suite</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            The DeepSpur Research Ecosystem
          </h2>
          <p className="mt-3 text-[#646B6F] text-base leading-relaxed">
            Modular tools, invariant representation metrics, and empirical stress tests engineered to surface brittle shortcuts across computer vision models.
          </p>
        </div>

        {/* Top 2 Major Metric Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card 1: Worst-Group Robustness Index (WGRI) */}
          <div className="real-glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md real-glass-subcard text-[#555E62]">
                  Benchmark Metric
                </span>
                <span className="text-xs font-mono font-medium text-[#C45252] flex items-center gap-1 real-glass-subcard px-2 py-0.5 rounded-full border border-[#F5CCCC] bg-[#FFF5F5]/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D96B6B]" /> High Discrepancy
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-bold text-[#1E292E] mb-2">
                Worst-Group Robustness Index (WGRI)
              </h3>
              <p className="text-sm text-[#5C656A] leading-relaxed">
                Measures the minimum accuracy across all subgroup slices. Standard accuracy hides that minority groups suffer severe misclassification.
              </p>

              {/* WGRI Visualization */}
              <div className="my-6 real-glass-subcard p-4 rounded-xl border border-white/80">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-mono text-[#6A7276]">Worst-Group Accuracy</span>
                  <span className="text-2xl font-mono font-bold text-[#D96B6B]">42.8%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-[#D96B6B] to-[#C85656] rounded-full shadow-sm" style={{ width: "42.8%" }} />
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-[#1E292E] z-10"
                    style={{ left: "94.6%" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-[#7D858A]">
                  <span>Subgroup: Waterbird / Land</span>
                  <span className="text-[#1E292E] font-medium">Standard Avg: 94.6%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/60 flex items-center justify-between text-xs text-[#6F767B]">
              <span>Discrepancy Gap: <strong className="text-[#D96B6B] font-mono">-51.8%</strong></span>
              <span className="font-mono text-[11px]">ERM ResNet-50</span>
            </div>
          </div>

          {/* Card 2: Spurious Exploitation Index (SEI) - Dark Slate Morphism Card */}
          <div className="real-glass-dark rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden group shadow-2xl">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-cyan-200 border border-white/15">
                  Diagnostic Coefficient
                </span>
                <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Real-time Tensor Audit
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-bold text-white mb-2">
                Spurious Exploitation Index (SEI)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Quantifies the ratio between gradient norms along background pixels versus core object masks. A score above 0.5 indicates background dominance.
              </p>

              {/* Gauge Display */}
              <div className="my-6 bg-black/35 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-mono text-slate-300">Exploitation Ratio</span>
                  <span className="text-2xl font-mono font-bold text-cyan-400">SEI = 0.74</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-[#D96B6B] rounded-full"
                    style={{ width: "74%" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-400">
                  <span>Threshold: 0.25 (Safe)</span>
                  <span className="text-[#FF9E9E] font-medium">Critical Bias (&gt;0.65)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>74% of gradient energy is anchored on background</span>
              <span className="font-mono text-[11px] text-cyan-300">P(Shortcut) = 0.88</span>
            </div>
          </div>
        </div>

        {/* Bottom 3 Cards: Slice Discovery, Intervention Lab, and Group Drift (Coral) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 3: Slice-Based Evaluation */}
          <div className="real-glass-card rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-9 h-9 rounded-lg real-glass-subcard flex items-center justify-center text-[#25333A] mb-4">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="font-editorial text-xl font-bold text-[#1E292E] mb-2">
                Slice-Based Evaluation
              </h4>
              <p className="text-xs text-[#5C656A] leading-relaxed mb-4">
                Automatically identifies blind spots and demographic slices without requiring manual group annotations via unsupervised embedding clustering.
              </p>
            </div>
            <div className="pt-3 border-t border-white/60 flex items-center justify-between text-xs font-mono text-[#778085]">
              <span>K-Means Spectral Slices</span>
              <span className="text-[#1E292E] font-semibold">k=4 clusters</span>
            </div>
          </div>

          {/* Card 4: Intervention Lab */}
          <div className="real-glass-card rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-9 h-9 rounded-lg real-glass-subcard flex items-center justify-center text-[#25333A] mb-4">
                <Sliders className="w-4 h-4" />
              </div>
              <h4 className="font-editorial text-xl font-bold text-[#1E292E] mb-2">
                Intervention Lab
              </h4>
              <p className="text-xs text-[#5C656A] leading-relaxed mb-3">
                Benchmark optimization methods side-by-side:
              </p>

              {/* Selector pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {strategies.map((strat) => (
                  <Magnet key={strat.id} padding={20} magnetStrength={3} scale={1.04} tilt={4}>
                    <button
                      onClick={() => setActiveStrategy(strat.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        activeStrategy === strat.id
                          ? "bg-[#1E292E] text-white shadow-xs font-bold"
                          : "real-glass-subcard text-[#555E62] hover:bg-white"
                      }`}
                    >
                      {strat.name.split(" ")[0]}
                    </button>
                  </Magnet>
                ))}
              </div>

              <div className="real-glass-subcard p-2.5 rounded-lg text-xs font-mono flex justify-between items-center">
                <span className="text-[#6D757A]">Worst Group:</span>
                <span className="text-[#1E292E] font-bold">{currentStrategy.worst}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/60 flex items-center justify-between text-xs font-mono text-[#778085]">
              <span>Robustness Gain</span>
              <span className="text-emerald-700 font-bold">+{currentStrategy.worst}</span>
            </div>
          </div>

          {/* Card 5: Group Drift Detection (Coral Morphism) */}
          <div className="real-glass-coral rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                  Active Guard
                </span>
              </div>
              <h4 className="font-editorial text-xl font-bold text-white mb-2">
                Group Drift Detection
              </h4>
              <p className="text-xs text-white/95 leading-relaxed mb-4">
                Monitors inference streams for distribution shifts where test backgrounds decouple from the training bias distribution, issuing instant out-of-distribution alerts.
              </p>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-mono text-white/90">
              <span>Drift Alert Threshold</span>
              <span className="font-bold bg-white/25 px-2 py-0.5 rounded">p &lt; 0.01</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

