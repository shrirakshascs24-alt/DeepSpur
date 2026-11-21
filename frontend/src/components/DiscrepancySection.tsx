"use client";

import React, { useState } from "react";
import { TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, Sliders, Info } from "lucide-react";

export default function DiscrepancySection() {
  const [hoveredEpoch, setHoveredEpoch] = useState<number | null>(24);

  // Epoch data points
  const epochData = [
    { epoch: 0, overall: 52.0, worst: 18.0 },
    { epoch: 3, overall: 74.2, worst: 26.5 },
    { epoch: 6, overall: 82.1, worst: 33.0 },
    { epoch: 9, overall: 87.5, worst: 38.2 },
    { epoch: 12, overall: 90.4, worst: 41.5 },
    { epoch: 15, overall: 92.1, worst: 43.1 },
    { epoch: 18, overall: 93.3, worst: 43.0 },
    { epoch: 21, overall: 94.0, worst: 42.9 },
    { epoch: 24, overall: 94.6, worst: 42.8 },
    { epoch: 27, overall: 95.1, worst: 42.6 },
    { epoch: 30, overall: 95.4, worst: 42.4 },
  ];

  const currentPoint =
    epochData.find((d) => d.epoch === hoveredEpoch) || epochData[8];

  return (
    <section id="discrepancy" className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>Empirical Discrepancy</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            Measure Beyond Overall Accuracy
          </h2>
          <p className="mt-3 text-[#646B6F] text-base leading-relaxed">
            Standard aggregate accuracy masks catastrophic failure in minority slices. DeepSpur continuously tracks worst-group generalization across every epoch to pinpoint where shortcut overfitting occurs.
          </p>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Training Curve Chart (7 cols) */}
          <div className="lg:col-span-7 real-glass-board rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                    Convergence Trajectory & Generalization Gap
                  </h3>
                  <span className="text-xs text-[#6F767B] font-mono">
                    Waterbirds Benchmark • ResNet-50 ERM Backbone
                  </span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-[#25333A] font-semibold">
                    <span className="w-3 h-0.5 bg-[#25333A] rounded-full" />
                    Overall Acc
                  </span>
                  <span className="flex items-center gap-1.5 text-[#D96B6B] font-semibold">
                    <span className="w-3 h-0.5 bg-[#D96B6B] rounded-full" />
                    Worst-Group Acc
                  </span>
                </div>
              </div>

              {/* Chart SVG Visualization */}
              <div className="relative w-full h-64 sm:h-72 my-2 real-glass-subcard rounded-2xl p-4 border border-white/90">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 220"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#EAE4D8" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="#EAE4D8" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="#EAE4D8" strokeDasharray="3 3" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#EAE4D8" strokeDasharray="3 3" />

                  {/* Y-axis labels */}
                  <text x="10" y="24" fontSize="10" fill="#889196" fontFamily="monospace">100%</text>
                  <text x="10" y="74" fontSize="10" fill="#889196" fontFamily="monospace">75%</text>
                  <text x="10" y="124" fontSize="10" fill="#889196" fontFamily="monospace">50%</text>
                  <text x="10" y="174" fontSize="10" fill="#889196" fontFamily="monospace">25%</text>

                  {/* Shaded Area of the Gap */}
                  <path
                    d="
                      M 40,116
                      Q 90,75 140,55
                      T 240,36
                      T 360,28
                      T 480,26
                      L 480,135
                      Q 360,132 240,132
                      T 140,145
                      T 40,185
                      Z
                    "
                    fill="url(#gapGradient)"
                    opacity="0.25"
                  />

                  {/* Linear Gradients */}
                  <defs>
                    <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D96B6B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D96B6B" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Overall Accuracy Curve (Dark Slate) */}
                  <path
                    d="
                      M 40,116
                      C 90,70 140,48 240,36
                      C 320,29 400,27 480,26
                    "
                    fill="none"
                    stroke="#1E292E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Worst-Group Accuracy Curve (Coral) */}
                  <path
                    d="
                      M 40,185
                      C 90,165 140,146 240,132
                      C 320,133 400,134 480,135
                    "
                    fill="none"
                    stroke="#D96B6B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Milestone Marker at Epoch 24 (X ~ 392) */}
                  <line
                    x1="392"
                    y1="20"
                    x2="392"
                    y2="185"
                    stroke="#D96B6B"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Points on marker */}
                  <circle cx="392" cy="28" r="4.5" fill="#1E292E" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="392" cy="134" r="4.5" fill="#D96B6B" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                {/* Floating Tooltip Pill */}
                <div className="absolute top-10 right-12 real-glass-dark text-white p-3 rounded-2xl shadow-2xl text-xs font-mono border border-white/20 pointer-events-none">
                  <div className="text-[10px] text-cyan-300 font-bold mb-1">
                    EPOCH 24 — THE SHORTCUT TRAP
                  </div>
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span>Overall Accuracy:</span>
                    <strong className="text-white">94.6%</strong>
                  </div>
                  <div className="flex justify-between gap-4 text-[#FFB0B0]">
                    <span>Worst Group Acc:</span>
                    <strong className="text-white">42.8%</strong>
                  </div>
                  <div className="mt-1 pt-1 border-t border-white/20 text-[10px] text-slate-400">
                    Vulnerability Gap: -51.8%
                  </div>
                </div>
              </div>

              {/* Epoch slider control */}
              <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between">
                <span className="text-xs font-mono text-[#6A7378]">
                  Audit Checkpoint: <strong className="text-[#1E292E]">Epoch {currentPoint.epoch}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="3"
                    value={currentPoint.epoch}
                    onChange={(e) => setHoveredEpoch(Number(e.target.value))}
                    className="w-36 accent-[#D96B6B] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#1E292E] font-bold">
                    {currentPoint.epoch}/30
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Metric Breakdown Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Metric 1: Overall Accuracy */}
            <div className="real-glass-card rounded-2xl p-5 border border-white/80 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#798185] block">
                  Aggregate Benchmark
                </span>
                <h4 className="font-editorial text-lg font-bold text-[#1E292E] mt-0.5">
                  Standard Overall Accuracy
                </h4>
                <p className="text-xs text-[#6B7479] mt-1">
                  Heavily skewed by 95% majority alignment in training distribution.
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-3xl font-mono font-bold text-[#1E292E]">
                  {currentPoint.overall}%
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-mono block mt-1">
                  Deceptive
                </span>
              </div>
            </div>

            {/* Metric 2: Worst Group Accuracy */}
            <div className="real-glass-card rounded-2xl p-5 border border-white/80 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#798185] block">
                  True Robustness Test
                </span>
                <h4 className="font-editorial text-lg font-bold text-[#1E292E] mt-0.5">
                  Worst-Group Accuracy
                </h4>
                <p className="text-xs text-[#6B7479] mt-1">
                  Performance on minority conflict group (Waterbird placed on forest land).
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-3xl font-mono font-bold text-[#D96B6B]">
                  {currentPoint.worst}%
                </span>
                <span className="text-[10px] text-[#C45050] bg-[#FFF0F0] border border-[#F5CCCC] px-2 py-0.5 rounded-md font-mono block mt-1">
                  Critical Vulnerability
                </span>
              </div>
            </div>

            {/* Metric 3: Coral Card - Spurious Vulnerability Gap */}
            <div className="real-glass-coral rounded-2xl p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/85">
                  Performance Divergence
                </span>
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="font-editorial text-2xl font-bold">
                    {(currentPoint.overall - currentPoint.worst).toFixed(1)}% Gap
                  </h4>
                  <p className="text-xs text-white/95 mt-1 max-w-xs leading-relaxed">
                    Under distribution shift, the model loses over half its predictive capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

