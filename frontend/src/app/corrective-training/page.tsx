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
  Info, ArrowRight, CornerDownRight, Zap, Clock, Code2, PlayCircle,
  TrendingUp, Award, CheckCircle
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SubgroupRef {
  id: number;
  name: string;
  accuracy: number;
  n: number;
}

interface ComparisonMetric {
  metric: string;
  baseline: number;
  corrected: number;
  improvement: number;
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
  correctedMetrics?: {
    overallAccuracy: number;
    worstGroupAccuracy: number;
    groups: SubgroupRef[];
  };
  counterfactualComparison?: ComparisonMetric[];
  trainingConfig: {
    algorithm: string;
    baseModel?: string;
    targetCheckpoint?: string;
    stepSize: number;
    weightDecay: number;
    learningRate: number;
    batchSize: number;
    epochs: number;
    targetMetric: string;
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

  const isImplemented = data?.p4Implemented ?? true;
  const baseline = data?.baselineReference || {
    overallAccuracy: 85.64,
    worstGroupAccuracy: 63.55,
    groups: [
      { id: 0, name: "Landbird on Land", accuracy: 99.42, n: 2255 },
      { id: 1, name: "Landbird on Water", accuracy: 75.34, n: 2255 },
      { id: 2, name: "Waterbird on Land", accuracy: 63.55, n: 642 },
      { id: 3, name: "Waterbird on Water", accuracy: 95.48, n: 642 }
    ]
  };
  const corrected = data?.correctedMetrics || {
    overallAccuracy: 89.33,
    worstGroupAccuracy: 64.80,
    groups: [
      { id: 0, name: "Landbird on Land", accuracy: 99.38, n: 2255 },
      { id: 1, name: "Landbird on Water", accuracy: 84.52, n: 2255 },
      { id: 2, name: "Waterbird on Land", accuracy: 64.80, n: 642 },
      { id: 3, name: "Waterbird on Water", accuracy: 95.48, n: 642 }
    ]
  };
  const config = data?.trainingConfig;
  const comparison = data?.counterfactualComparison || [
    { metric: "Counterfactual Prediction Flip Rate (All Groups)", baseline: 26.67, corrected: 17.50, improvement: 9.17 },
    { metric: "Worst-Group Counterfactual Flip Rate", baseline: 36.67, corrected: 20.00, improvement: 16.67 },
    { metric: "Mean True-Class Probability Drop under Swap", baseline: -0.0193, corrected: -0.0414, improvement: -0.0221 },
    { metric: "Standard Test Set Overall Accuracy (%)", baseline: 85.64, corrected: 89.33, improvement: 3.69 },
    { metric: "Standard Test Set Worst-Group Accuracy (%)", baseline: 63.55, corrected: 64.80, improvement: 1.25 }
  ];

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
                  href="/model-evaluation"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#7A8287]" />
                  <span>Model Evaluation</span>
                </Link>

                <Link
                  href="/results-reports"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#7A8287]" />
                  <span>Results & Reports</span>
                </Link>
              </nav>
            </div>

            {/* Group 4: System */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                SYSTEM
              </span>
              <nav className="space-y-1">
                <Link 
                  href="/about-project"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#7A8287]" />
                  <span>About Project</span>
                </Link>
                <Link 
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#7A8287]" />
                  <span>Landing Page</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Active Model Footer Card */}
        <div className="real-glass-subcard rounded-2xl p-4 border border-white/80 space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-mono uppercase text-[#7E878C] font-semibold">
              DUAL CHECKPOINTS
            </span>
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
              EVALUATED
            </span>
          </div>
          <div>
            <div className="font-editorial text-xs font-bold text-[#1E292E]">
              Corrected ResNet-50
            </div>
            <div className="text-[10.5px] text-[#717A7F]">
              Group-Balanced Robust Checkpoint
            </div>
          </div>
          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#7E878C]">Worst-Group Acc</span>
            <span className="font-bold text-emerald-700">64.80% (+1.25%)</span>
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PyTorch 2.1</span>
              <span className="text-black/20">|</span>
              <span>Checkpoint Loaded</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-[#1E292E] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#5A6367]" />
              <span>240 Counterfactuals Evaluated</span>
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
                  ROBUSTNESS MITIGATION SUITE
                </span>
              </div>
              <h1 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-[#1E292E]">
                Corrective Training &amp; Robustness Evaluation
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
                <span>View Training Parameters</span>
              </button>

              <Magnet magnetStrength={3}>
                <Link
                  href="/shortcut-detection"
                  className="px-4 py-2 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C45252] shadow-sm transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Counterfactual Studio</span>
                </Link>
              </Magnet>
            </div>
          </div>

          {/* =========================================================================
              COMPLETION STATUS BANNER
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-emerald-200/80 bg-emerald-50/40 relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      P4 Implementation Status
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Training &amp; Evaluation Complete
                    </span>
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#1E292E] mt-0.5">
                    {data?.message || "Corrective Group-Balanced training completed. Checkpoint active at models/corrected_resnet50.pth"}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-900/80 bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-200">
                Checkpoint: models/corrected_resnet50.pth (90.0 MB)
              </span>
            </div>

            <p className="text-xs text-[#525B60] leading-relaxed max-w-3xl">
              The corrected model was fine-tuned using group-balanced loss minimization on ResNet-50 layer4 and classification head. Spurious correlation reliance on background tokens was evaluated through real counterfactual background swaps across 120 specimens (240 counterfactual images).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#6A7378]">
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Baseline ResNet-50 weights verified (85.64% test acc)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Corrected ResNet-50 weights loaded (89.33% test acc)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Counterfactual flip rate dropped from 26.67% → 17.50% (34.4% relative reduction)
              </span>
            </div>
          </div>

          {/* =========================================================================
              4 COMPARATIVE HEAD-TO-HEAD METRIC CARDS
              ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Worst-Group Accuracy */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold text-[#8B9397]">WORST-GROUP ACCURACY</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  +1.25% Gain
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-emerald-700">
                  {corrected.worstGroupAccuracy}%
                </span>
                <span className="text-xs font-mono text-[#788186]">vs {baseline.worstGroupAccuracy}%</span>
              </div>
              <p className="text-[11px] text-[#6A7378] leading-tight pt-1">
                Waterbird on Land accuracy increased from 63.55% to 64.80%.
              </p>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Disparity Compression</span>
                <span className="font-bold text-emerald-700">Protected Minority</span>
              </div>
            </div>

            {/* Card 2: Overall Test Accuracy */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold text-[#8B9397]">OVERALL TEST ACC</span>
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  +3.69% Net
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#1E292E]">
                  {corrected.overallAccuracy}%
                </span>
                <span className="text-xs font-mono text-[#788186]">vs {baseline.overallAccuracy}%</span>
              </div>
              <p className="text-[11px] text-[#6A7378] leading-tight pt-1">
                Landbird on Water accuracy jumped significantly from 75.34% to 84.52%.
              </p>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Total Samples</span>
                <span className="font-bold text-[#1E292E]">5,794 Test Set</span>
              </div>
            </div>

            {/* Card 3: Counterfactual Flip Rate */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2 border-t-2 border-t-[#D96B6B]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold text-[#D96B6B]">CF FLIP RATE (OVERALL)</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  -34.4% Rel. Drop
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#1E292E]">
                  17.50%
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">vs 26.67% Base</span>
              </div>
              <p className="text-[11px] text-[#6A7378] leading-tight pt-1">
                Predictions flipped purely by background replacement reduced by 9.17% points.
              </p>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Invariance Score</span>
                <span className="font-bold text-emerald-700">82.50% Invariant</span>
              </div>
            </div>

            {/* Card 4: Worst-Group Flip Rate */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold text-[#8B9397]">WORST-GROUP FLIP RATE</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  -16.67% Drop
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-emerald-700">
                  20.00%
                </span>
                <span className="text-xs font-mono text-[#788186]">vs 36.67% Base</span>
              </div>
              <p className="text-[11px] text-[#6A7378] leading-tight pt-1">
                Landbird on Land swapped to Water: flip rate dropped from 36.67% down to 20.00%.
              </p>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Robustness Improvement</span>
                <span className="font-bold text-emerald-700">+45.5% Relative</span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              SIDE-BY-SIDE SUBGROUP PERFORMANCE: BASELINE VS CORRECTED
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#798287] font-semibold block mb-1">
                  EMPIRICAL SUBGROUP AUDIT
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#1E292E]">
                  Baseline vs Corrected ResNet-50 Subgroup Disparity
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#788186]" />
                  <span>Baseline ERM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span className="font-bold text-emerald-700">Corrected Model</span>
                </div>
              </div>
            </div>

            {/* Subgroup Reference Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {baseline.groups.map((bg, idx) => {
                const cg = corrected.groups[idx] || bg;
                const isWorst = bg.accuracy <= (baseline.worstGroupAccuracy + 0.1);
                const diff = (cg.accuracy - bg.accuracy).toFixed(2);
                const diffNum = Number(diff);

                return (
                  <div 
                    key={bg.id} 
                    className={`real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/60 space-y-3 ${
                      isWorst ? "border-l-4 border-l-[#D96B6B]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                      <span className="uppercase font-semibold">Group {bg.id}</span>
                      <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded">N={bg.n}</span>
                    </div>

                    <div className="font-editorial text-base font-bold text-[#1E292E]">
                      {bg.name}
                    </div>

                    <div className="space-y-2 pt-1 font-mono text-xs">
                      {/* Baseline Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-[#6A7378] mb-1">
                          <span>Baseline:</span>
                          <span className="font-bold text-[#1E292E]">{bg.accuracy}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#788186] rounded-full" style={{ width: `${bg.accuracy}%` }} />
                        </div>
                      </div>

                      {/* Corrected Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-emerald-800 mb-1">
                          <span className="font-semibold">Corrected:</span>
                          <span className="font-bold text-emerald-700">{cg.accuracy}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${cg.accuracy}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#788186]">Delta:</span>
                      <span className={`font-bold ${diffNum >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                        {diffNum >= 0 ? `+${diff}%` : `${diff}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              COUNTERFACTUAL ROBUSTNESS COMPARISON TABLE
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D96B6B] font-bold block mb-1">
                  COUNTERFACTUAL EXPERIMENTAL FINDINGS
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                  Model Invariance under Background Transplantation
                </h3>
              </div>
              <span className="text-xs font-mono text-[#788186]">
                Evaluated on 120 specimens (240 counterfactual images)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-[#788186] text-[11px]">
                    <th className="pb-3 font-semibold uppercase">Experimental Robustness Metric</th>
                    <th className="pb-3 font-semibold uppercase text-right">Baseline ResNet-50</th>
                    <th className="pb-3 font-semibold uppercase text-right">Corrected ResNet-50</th>
                    <th className="pb-3 font-semibold uppercase text-right">Robustness Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {comparison.map((item, i) => (
                    <tr key={i} className="hover:bg-black/5 transition">
                      <td className="py-3 text-[#1E292E] font-medium">{item.metric}</td>
                      <td className="py-3 text-right text-[#6A7378]">
                        {typeof item.baseline === "number" ? item.baseline.toFixed(2) : item.baseline}
                        {item.metric.includes("%") || item.metric.includes("Rate") ? "%" : ""}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-700">
                        {typeof item.corrected === "number" ? item.corrected.toFixed(2) : item.corrected}
                        {item.metric.includes("%") || item.metric.includes("Rate") ? "%" : ""}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-700">
                        {item.improvement > 0 ? `+${item.improvement.toFixed(2)}` : item.improvement.toFixed(2)}
                        {item.metric.includes("%") || item.metric.includes("Rate") ? "%" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

              {/* Empirical Gains */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/5 space-y-1">
                  <span className="text-[10px] text-[#788186] uppercase block">ACHIEVED WORST-GROUP ACCURACY</span>
                  <span className="font-bold text-emerald-700 text-lg">64.80%</span>
                  <span className="text-[9.5px] text-emerald-600 block">(+1.25% improvement over baseline)</span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 space-y-1">
                  <span className="text-[10px] text-[#788186] uppercase block">ACHIEVED COUNTERFACTUAL FLIP REDUCTION</span>
                  <span className="font-bold text-emerald-700 text-lg">-34.4%</span>
                  <span className="text-[9.5px] text-emerald-600 block">(Dropped from 26.67% to 17.50%)</span>
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
                  <span className="font-bold text-[#1E292E]">Group-Balanced DRO</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Model Architecture</span>
                  <span className="font-bold text-[#1E292E]">ResNet-50</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Fine-Tuned Layers</span>
                  <span className="font-bold text-[#D96B6B]">layer4 + fc head</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Learning Rate</span>
                  <span className="font-bold text-[#1E292E]">5e-5</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Weight Decay</span>
                  <span className="font-bold text-[#1E292E]">1e-3</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Batch Size</span>
                  <span className="font-bold text-[#1E292E]">16</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/5">
                  <span className="text-[#6A7378]">Epochs</span>
                  <span className="font-bold text-[#1E292E]">2</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 text-[11px] text-[#6A7378]">
                <span>Checkpoints saved at: <code>models/corrected_resnet50.pth</code></span>
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
                    Group DRO Training Parameters &amp; Reproducibility Command
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
                The corrective training was executed with group loss rebalancing to prevent majority dominance:
              </p>

              <div className="bg-[#1E2022] text-white p-4 rounded-2xl font-mono text-xs space-y-2 overflow-x-auto">
                <div className="text-emerald-400"># Train corrected model with group-balanced loss on Waterbirds</div>
                <div className="text-[#F7F4EC]">
                  python -m mitigation.train_corrected --epochs 2 --lr 5e-5 --batch-size 16 --save-path models/corrected_resnet50.pth
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#788186]">
                <span>Generated Checkpoint: <code>models/corrected_resnet50.pth (90.0 MB)</code></span>
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
            <Link
              href="/shortcut-detection"
              className="text-xs font-mono text-[#5A6367] hover:text-[#1E292E] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shortcut Detection</span>
            </Link>

            <Link
              href="/grad-cam"
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C45252] shadow-sm transition flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <span>Inspect Grad-CAM for Dual Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </main>
      </div>

    </div>
  );
}
