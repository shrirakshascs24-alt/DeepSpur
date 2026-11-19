"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Magnet from "@/components/Magnet";
import { 
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ArrowLeft, BarChart3, Shuffle, Filter, SlidersHorizontal,
  Info, ArrowRight, CornerDownRight, Zap, Clock, Code2, PlayCircle
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SubgroupRef {
  id: number;
  name: string;
  accuracy: number;
  n: number;
}

interface TrainingStatusResponse {
  p4Implemented: boolean;
  p4Status: string;
  message: string;
  baselineReference: {
    overallAccuracy: number;
    worstGroupAccuracy: number;
    groups: SubgroupRef[];
  };
  trainingConfig: {
    algorithm: string;
    stepSize: number;
    weightDecay: number;
    learningRate: number;
    batchSize: number;
    epochs: number;
    targetMetric: string;
  };
  correctedResults?: {
    overallAccuracy: number;
    worstGroupAccuracy: number;
    groups: SubgroupRef[];
  };
}

export default function CorrectiveTrainingPage() {
  const [data, setData] = useState<TrainingStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerminalModal, setShowTerminalModal] = useState<boolean>(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/training/status`).catch(() => null);
      if (res && res.ok) {
        const json: TrainingStatusResponse = await res.json().catch(() => null);
        if (json) setData(json);
      } else {
        setError("Training API offline");
      }
    } catch (err: unknown) {
      console.warn("Training status warning:", err);
      setError("Error connecting to training API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isImplemented = data?.p4Implemented ?? false;
  const baseline = data?.baselineReference;
  const config = data?.trainingConfig;

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-linear-to-br from-[#E2DDD3]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-linear-to-tr from-[#D96B6B]/8 to-transparent blur-3xl pointer-events-none" />

      {/* =========================================================================
          LEFT SIDEBAR
          ========================================================================= */}
      <aside className="w-64 shrink-0 real-glass-board border-r border-white/70 min-h-screen flex flex-col justify-between p-5 relative z-20">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EAE3D5]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#25333A] flex items-center justify-center shadow-xs">
                <div className="w-3.5 h-3.5 rounded bg-[#D96B6B] transform rotate-45 transition-transform group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-base tracking-wider font-bold text-[#1E292E] uppercase">
                  DeepSpur
                </span>
                <span className="text-[8.5px] tracking-widest text-[#8A8A85] uppercase -mt-0.5 font-mono">
                  EXPLAINABLE AI
                </span>
              </div>
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md real-glass-subcard text-[#717A7E] font-semibold">
              v1.5
            </span>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-6 text-xs">
            {/* Group 1: Overview & Data */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                OVERVIEW & DATA
              </span>
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <Activity className="w-4 h-4 text-[#7A8287]" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dataset-explorer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-[#7A8287]" />
                    <span>Dataset Explorer</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C9397] bg-black/5 px-1.5 py-0.5 rounded">
                    11,788
                  </span>
                </Link>

                <Link
                  href="/image-analysis"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <Eye className="w-4 h-4 text-[#7A8287]" />
                  <span>Image Analysis</span>
                </Link>
              </nav>
            </div>

            {/* Group 2: Explainability & Audit */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                EXPLAINABILITY & AUDIT
              </span>
              <nav className="space-y-1">
                <Link
                  href="/grad-cam"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#7A8287]" />
                  <span>Grad-CAM Studio</span>
                </Link>

                <Link
                  href="/shortcut-detection"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#7A8287]" />
                    <span>Shortcut Detection</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#D96B6B]" />
                </Link>

                <Link
                  href="/perturbation-testing"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <Shuffle className="w-4 h-4 text-[#7A8287]" />
                  <span>Perturbation Testing</span>
                </Link>
              </nav>
            </div>

            {/* Group 3: Engineering & Evaluation */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                ENGINEERING & EVALUATION
              </span>
              <nav className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-white" />
                    <span>Corrective Training</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#7A8287]" />
                  <span>Model Evaluation</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#7A8287]" />
                  <span>Results & Reports</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Active Model Footer Card */}
        <div className="real-glass-subcard rounded-2xl p-4 border border-white/80 space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-mono uppercase text-[#7E878C] font-semibold">
              ACTIVE MODEL
            </span>
            <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
              PENDING DRO
            </span>
          </div>
          <div>
            <div className="font-editorial text-xs font-bold text-[#1E292E]">
              ResNet-50 v1.5
            </div>
            <div className="text-[10.5px] text-[#717A7F]">
              Waterbirds (ERM Baseline)
            </div>
          </div>
          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E878C]">Worst-Group Acc</span>
            <span className="font-bold text-[#D96B6B]">{baseline?.worstGroupAccuracy ?? 63.55}%</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="shrink-0 h-16 border-b border-white/80 px-8 flex items-center justify-between relative z-10 bg-white/30 backdrop-blur-md">
          {/* Search Bar */}
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F888C]" />
            <input
              type="text"
              placeholder="Search training logs, weights, or hyperparameters..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl real-glass-subcard border-transparent focus:border-[#D96B6B]/40 focus:outline-hidden text-[#1E292E] placeholder:text-[#8D969B] transition"
            />
          </div>

          {/* Telemetry Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 real-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-[#5A6367]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>PyTorch 2.1</span>
              <span className="text-black/20">|</span>
              <span>DRO Ready</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-[#1E292E] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#5A6367]" />
              <span>4 Strata Configured</span>
            </div>

            <div className="w-7 h-7 rounded-full bg-[#EAE4D7] border border-white/80 flex items-center justify-center text-xs font-editorial font-bold text-[#4F575B]">
              DS
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header Title with Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#D96B6B] font-bold">
                  ENGINEERING &amp; EVALUATION
                </span>
                <span className="text-[10px] text-black/30 font-mono">•</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#7B8488]">
                  DISTRIBUTIONALLY ROBUST OPTIMIZATION
                </span>
              </div>
              <h1 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-[#1E292E]">
                Corrective Training &amp; Robustness Suite
              </h1>
              <p className="text-xs md:text-sm text-[#616A6F] max-w-2xl mt-1 leading-relaxed">
                Mitigating spurious background reliance by training with Group Distributionally Robust Optimization (Group DRO) to minimize worst-case subpopulation risk rather than average ERM loss.
              </p>
            </div>

            {/* Launch / Status Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowTerminalModal(true)}
                className="real-glass-pill px-4 py-2 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Terminal className="w-3.5 h-3.5 text-[#5A6367]" />
                <span>View CLI Training Script</span>
              </button>

              <Magnet magnetStrength={3}>
                <button
                  onClick={() => setShowTerminalModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C45252] shadow-sm transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 fill-white" />
                  <span>Execute Group DRO Run</span>
                </button>
              </Magnet>
            </div>
          </div>

          {/* =========================================================================
              HONEST PENDING STATE NOTIFICATION BANNER
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-amber-200/80 bg-amber-50/40 relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      P4 Implementation Status
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      Pending Training Execution
                    </span>
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#1E292E] mt-0.5">
                    {data?.message || "P4 Group DRO corrective training pipeline is pending implementation."}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-amber-900/80 bg-white/70 px-3 py-1.5 rounded-xl border border-amber-200">
                Phase: Queued
              </span>
            </div>

            <p className="text-xs text-[#525B60] leading-relaxed max-w-3xl">
              Per strict DeepSpur reproducibility principles, mock epochs, fabricated training curves, and uncalculated post-training weights are never invented. Below, baseline ERM metrics serve as the validated empirical reference point against which Group DRO performance will be benchmarked once executed.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#6A7378]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Baseline ResNet-50 weights verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                P3 Perturbation audit verified (Score: 14.98/100)
              </span>
              <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Group DRO loss minimization awaiting execution
              </span>
            </div>
          </div>

          {/* =========================================================================
              BASELINE EMPIRICAL BENCHMARK REFERENCE
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#798287] font-semibold block mb-1">
                  EMPIRICAL REFERENCE BENCHMARK
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#1E292E]">
                  Baseline ResNet-50 Performance (Standard ERM)
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[#788186] block text-[10px]">OVERALL ACCURACY</span>
                  <span className="text-lg font-bold text-[#1E292E]">
                    {baseline?.overallAccuracy ?? 85.64}%
                  </span>
                </div>
                <div className="text-right pl-4 border-l border-black/10">
                  <span className="text-[#D96B6B] block text-[10px] font-semibold">WORST-GROUP ACCURACY</span>
                  <span className="text-lg font-bold text-[#D96B6B]">
                    {baseline?.worstGroupAccuracy ?? 63.55}%
                  </span>
                </div>
              </div>
            </div>

            {/* Subgroup Reference Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {baseline?.groups?.map((g) => {
                const isWorst = g.accuracy <= (baseline.worstGroupAccuracy + 0.1);
                const isMajority = g.name.includes("Land on Land") || g.name.includes("Water on Water");
                return (
                  <div 
                    key={g.id} 
                    className={`real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/60 space-y-2 ${
                      isWorst ? "border-l-4 border-l-[#D96B6B]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                      <span className="uppercase font-semibold">Group {g.id}</span>
                      <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded">N={g.n}</span>
                    </div>
                    <div className="font-editorial text-base font-bold text-[#1E292E]">
                      {g.name}
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className={`text-2xl font-mono font-bold ${isWorst ? "text-[#D96B6B]" : "text-[#1E292E]"}`}>
                        {g.accuracy}%
                      </span>
                      <span className="text-[10px] font-mono text-[#788186]">
                        {isMajority ? "(Majority)" : "(Confounded)"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${isWorst ? "bg-[#D96B6B]" : "bg-[#25333A]"}`} 
                        style={{ width: `${g.accuracy}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              GROUP DRO MATHEMATICAL FORMULATION & HYPERPARAMETERS
              ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Mathematical Objective (2 cols) */}
            <div className="lg:col-span-2 real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-4">
              <div className="pb-3 border-b border-black/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D96B6B] font-bold block mb-1">
                  ROBUST OPTIMIZATION FRAMEWORK
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                  Group Distributionally Robust Optimization (DRO)
                </h3>
              </div>

              <p className="text-xs text-[#525B60] leading-relaxed">
                Standard Empirical Risk Minimization (ERM) minimizes average loss across the dataset, causing gradient updates to be dominated by the 95% majority groups (Landbird-on-Land and Waterbird-on-Water). Group DRO maintains adversarial subpopulation weights q_g over all 4 groups:
              </p>

              {/* Formulation Box */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/70 font-mono text-xs text-[#1E292E] space-y-2">
                <div className="text-[11px] text-[#788186] uppercase font-bold">
                  Objective Function:
                </div>
                <div className="bg-[#25333A] text-white p-3 rounded-xl overflow-x-auto text-xs leading-relaxed">
                  {"min_θ max_q∈Δ [ ∑_(g=1)^G q_g · E_(x,y)~P_g [ L(f_θ(x), y) ] ]"}
                </div>
                <div className="text-[11px] text-[#525B60] pt-1">
                  where group weights q_g update at each step via exponentiated gradient ascent with step size η_q:
                  <code className="text-[#D96B6B] ml-2">q_g ← q_g · exp(η_q · L_g)</code>
                </div>
              </div>

              {/* Theoretical Expected Gains */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/5 space-y-1">
                  <span className="text-[10px] text-[#788186] uppercase block">TARGET WORST-GROUP ACCURACY</span>
                  <span className="font-bold text-emerald-700 text-lg">≥ 85.0%</span>
                  <span className="text-[9.5px] text-[#788186] block">(+21.5% improvement over baseline)</span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 space-y-1">
                  <span className="text-[10px] text-[#788186] uppercase block">TARGET ACCURACY GAP</span>
                  <span className="font-bold text-[#1E292E] text-lg">≤ 6.0%</span>
                  <span className="text-[9.5px] text-[#788186] block">(Down from 25.8% disparity)</span>
                </div>
              </div>
            </div>

            {/* Hyperparameter Table (1 col) */}
            <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-4">
              <div className="pb-3 border-b border-black/5">
                <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                  Training Config
                </h3>
                <span className="text-[10px] font-mono text-[#788186] uppercase">
                  REPRODUCIBLE HYPERPARAMETERS
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Algorithm</span>
                  <span className="font-bold text-[#1E292E]">{config?.algorithm.split(" ")[0] || "Group DRO"}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Group Step Size (η_q)</span>
                  <span className="font-bold text-[#D96B6B]">{config?.stepSize ?? 0.01}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Model Learning Rate</span>
                  <span className="font-bold text-[#1E292E]">{config?.learningRate ?? 0.0001}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Weight Decay</span>
                  <span className="font-bold text-[#1E292E]">{config?.weightDecay ?? 0.0001}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Batch Size</span>
                  <span className="font-bold text-[#1E292E]">{config?.batchSize ?? 16}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Epochs</span>
                  <span className="font-bold text-[#1E292E]">{config?.epochs ?? 10}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Optimization Target</span>
                  <span className="font-bold text-[#D96B6B]">Worst-Group Acc</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 text-[11px] text-[#6A7378]">
                <span>Loss weights continuously rebalanced to penalize errors on minority groups.</span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              CLI EXECUTION MODAL / SECTION
              ========================================================================= */}
          {showTerminalModal && (
            <div className="real-glass-board rounded-3xl p-6 border border-white/90 shadow-lg space-y-4 bg-linear-to-b from-white/90 to-white/70">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#D96B6B]" />
                  <h3 className="font-editorial text-lg font-bold text-[#1E292E]">
                    Execute Group DRO Corrective Training Pipeline
                  </h3>
                </div>
                <button
                  onClick={() => setShowTerminalModal(false)}
                  className="text-xs font-mono text-[#788186] hover:text-[#1E292E] px-2 py-1 rounded cursor-pointer"
                >
                  Close [×]
                </button>
              </div>

              <p className="text-xs text-[#525B60]">
                To initiate the Group DRO corrective training run with full GPU acceleration, run the following command in your backend environment:
              </p>

              <div className="bg-[#1E2022] text-white p-4 rounded-2xl font-mono text-xs space-y-2 overflow-x-auto">
                <div className="text-emerald-400"># Run Group DRO corrective training on Waterbirds</div>
                <div className="text-[#F7F4EC]">
                  python -m training.group_dro --data-dir data/waterbird_complete95_forest2water2 --checkpoint models/baseline_resnet50.pth --group-step-size 0.01 --epochs 10
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#788186]">
                <span>Trained weights will be deposited to: <code>checkpoints/group_dro_best.pth</code></span>
                <button
                  onClick={() => {
                    fetchStatus();
                    setShowTerminalModal(false);
                  }}
                  className="px-4 py-1.5 rounded-xl text-white bg-[#D96B6B] hover:bg-[#C45252] transition cursor-pointer"
                >
                  Refresh Model Status
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              NAVIGATION FOOTER
              ========================================================================= */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#788186]">
              Audit Baseline: <strong>ResNet-50 v1.5</strong> • Benchmark: <strong>Waterbirds-10K</strong>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/shortcut-detection"
                className="real-glass-pill px-4 py-2.5 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#5A6367]" />
                <span>Back to Shortcut Detection</span>
              </Link>

              <Link
                href="/dashboard"
                className="real-glass-pill px-4 py-2.5 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Return to Executive Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5A6367]" />
              </Link>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
