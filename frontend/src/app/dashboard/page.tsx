"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Magnet from "@/components/Magnet";
import { 
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  Clock, ArrowLeft, BarChart3, Shuffle
} from "lucide-react";
import { ModelMetricsResponse, DatasetStatsResponse } from "@/types/metrics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchSafe = async (url: string) => {
        try {
          return await fetch(url, { cache: "no-store" });
        } catch {
          return null;
        }
      };

      const [metricsRes, datasetRes] = await Promise.all([
        fetchSafe(`${API_BASE_URL}/api/metrics`),
        fetchSafe(`${API_BASE_URL}/api/dataset/stats`)
      ]);

      let hasData = false;

      if (metricsRes && metricsRes.ok) {
        const mData: ModelMetricsResponse = await metricsRes.json().catch(() => null);
        if (mData) {
          setMetrics(mData);
          hasData = true;
        }
      }

      if (datasetRes && datasetRes.ok) {
        const dData: DatasetStatsResponse = await datasetRes.json().catch(() => null);
        if (dData) {
          setDatasetStats(dData);
          hasData = true;
        }
      }

      if (!hasData) {
        setError("FastAPI connection offline (http://localhost:8000). Start backend via uvicorn.");
      }
    } catch (err: unknown) {
      console.warn("FastAPI fetch warning:", err);
      setError("FastAPI connection offline (http://localhost:8000). Start backend via uvicorn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Format accuracy percentages
  const formatPct = (val?: number | null, fallback = "Not available") => {
    if (loading) return "Loading...";
    if (val === undefined || val === null) return fallback;
    const num = val <= 1 ? val * 100 : val;
    return `${num.toFixed(1)}%`;
  };

  // Find backend group accuracy by matching ID or name if available
  const getGroupAcc = (id: number, fallback = "Not available") => {
    if (loading) return "Loading...";
    if (!metrics?.groups) return fallback;
    const g = metrics.groups.find(item => item.id === id);
    if (g && typeof g.accuracy === "number") return `${g.accuracy.toFixed(1)}%`;
    return fallback;
  };

  // Group ID mapping:
  // 0: Landbird on Land (Land / Land)
  // 1: Landbird on Water (Land / Water)
  // 2: Waterbird on Land (Water / Land)
  // 3: Waterbird on Water (Water / Water)

  const getSubgroupCount = (id: number, fallback = "Not available") => {
    if (loading) return "...";
    if (!datasetStats?.testSubgroups) return fallback;
    const g = datasetStats.testSubgroups.find(item => item.id === id);
    return g ? g.count.toLocaleString() : fallback;
  };

  const getSubgroupPct = (id: number, fallback = "N/A") => {
    if (loading) return "...";
    if (!datasetStats?.testSubgroups) return fallback;
    const g = datasetStats.testSubgroups.find(item => item.id === id);
    return g ? `${g.percentage.toFixed(1)}%` : fallback;
  };

  const evalSampleCount = metrics?.groups
    ? metrics.groups.reduce((acc, g) => acc + (g.sampleCount || 0), 0).toLocaleString()
    : (loading ? "..." : "Not available");

  const overallAccText = formatPct(metrics?.overallAccuracy, "Not available");
  const worstGroupAccText = formatPct(metrics?.worstGroupAccuracy, "Not available");

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Background Ambient Orbs (Provides frosted glass depth) */}
      <div className="ambient-orb-coral w-[550px] h-[550px] top-[100px] left-[200px] opacity-30 pointer-events-none -z-10" />
      <div className="ambient-orb-amber w-[500px] h-[500px] top-[600px] right-[50px] opacity-25 pointer-events-none -z-10" />
      <div className="ambient-orb-cyan w-[450px] h-[450px] bottom-[100px] left-[350px] opacity-20 pointer-events-none -z-10" />

      {/* =========================================================================
          LEFT SIDEBAR (EXACT MATCH TO STITCH SPECIFICATION)
          ========================================================================= */}
      <aside className="w-64 shrink-0 real-glass-board border-r border-white/70 min-h-screen flex flex-col justify-between p-5 relative z-20">
        <div>
          {/* Brand Logo & Version Badge */}
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

          {/* Navigation Menu Groups */}
          <div className="space-y-6 text-xs">
            {/* Group 1: Overview & Data */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                OVERVIEW & DATA
              </span>
              <nav className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-white" />
                    <span>Dashboard</span>
                  </div>
                </div>

                <Link
                  href="/dataset-explorer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-[#7A8287]" />
                    <span>Dataset Explorer</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C9397] bg-black/5 px-1.5 py-0.5 rounded">
                    {loading ? "..." : (datasetStats?.totalCorpus ? datasetStats.totalCorpus.toLocaleString() : "11,788")}
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
                <Link
                  href="/corrective-training"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-[#7A8287]" />
                    <span>Corrective Training</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </Link>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors cursor-pointer">
                  <BarChart3 className="w-4 h-4 text-[#7A8287]" />
                  <span>Model Evaluation</span>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors cursor-pointer">
                  <FileText className="w-4 h-4 text-[#7A8287]" />
                  <span>Results & Reports</span>
                </div>
              </nav>
            </div>

            {/* Group 4: System */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                SYSTEM
              </span>
              <nav className="space-y-1">
                <Link 
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#7A8287]" />
                  <span>Landing Page</span>
                </Link>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors cursor-pointer">
                  <Compass className="w-4 h-4 text-[#7A8287]" />
                  <span>About Project</span>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Active Model Subcard */}
        <div className="real-glass-subcard rounded-2xl p-3.5 border border-white/80 bg-white/70 shadow-xs mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-[#737C81] font-semibold">
              ACTIVE MODEL
            </span>
            <span className="text-[9px] font-mono bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">
              CUDA:0
            </span>
          </div>
          <div className="text-xs font-bold text-[#1E292E]">ResNet-50 v1.5</div>
          <div className="text-[11px] text-[#717A7E] mb-2 font-mono">Waterbirds (ERM Baseline)</div>
          
          <div className="pt-2 border-t border-[#EAE3D5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#838B90] text-[11px]">Worst-Group Acc</span>
            <strong className="text-[#D96B6B] font-bold">{worstGroupAccText}</strong>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header / Search & Telemetry Bar */}
        <header className="px-8 py-4.5 real-glass-subcard border-b border-white/60 bg-white/40 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          {/* Search Bar */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full real-glass-subcard bg-white/70 max-w-md w-full shadow-2xs border border-white/80">
            <Search className="w-4 h-4 text-[#7D858A]" />
            <input 
              type="text" 
              placeholder="Search image ID, batch, layer, or run..."
              className="bg-transparent text-xs text-[#1E292E] placeholder-[#8C9498] focus:outline-none w-full font-mono"
              readOnly
            />
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="real-glass-pill px-3 py-1.5 rounded-full flex items-center gap-2 text-[#4A555B] bg-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PyTorch 2.1</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full text-[#4A555B] bg-white/70">
              <span>CUDA-0 [98%]</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-cyan-800 bg-cyan-50/70 border-cyan-200">
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              <span>Test Set: {loading ? "..." : (datasetStats?.splits?.test ? datasetStats.splits.test.toLocaleString() : "5,794")}</span>
            </div>

            <button
              onClick={fetchAllData}
              disabled={loading}
              title="Refresh data from FastAPI"
              className="real-glass-pill p-2 rounded-full hover:bg-white text-[#4A555B] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#D96B6B]" : ""}`} />
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-7">
          
          {/* Checkpoint Notice Banner */}
          <div className="px-4 py-2.5 rounded-xl real-glass-subcard border-l-4 border-l-amber-500 bg-amber-50/50 flex items-center justify-between text-xs text-[#6F5B2E]">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Backend Checkpoint Notice:</strong> <code>checkpoints/baseline_best.pth</code> not loaded. ResNet-50 is currently initialized with baseline weights.</span>
            </span>
            <span className="font-mono text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
              FastAPI: {error ? "Offline" : "Connected"}
            </span>
          </div>

          {/* Page Headline & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#B84E4E] bg-[#FCEBEA] border border-[#F5CCCC] font-mono text-[11px] font-semibold tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D96B6B] animate-ping" />
                <span>AUDIT BASELINE: ACTIVE • BENCHMARK: WATERBIRDS-10K</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[40px] text-[#1E292E] font-bold leading-tight">
                Research Intelligence &amp; Shortcut Audit
              </h1>
              <p className="mt-1.5 text-sm text-[#616B70] leading-relaxed">
                Monitoring background bias, feature attribution leaks, and worst-group vulnerabilities in ResNet-50 v1.5.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Magnet padding={40} magnetStrength={3} scale={1.03} tilt={6}>
                <button className="real-glass-pill inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-[#1E292E] hover:bg-white transition-all cursor-pointer bg-white/70">
                  <Play className="w-3.5 h-3.5 text-[#5A6367]" />
                  <span>Run Inference</span>
                </button>
              </Magnet>

              <Magnet padding={40} magnetStrength={3} scale={1.03} tilt={6}>
                <button className="real-glass-pill inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-[#1E292E] hover:bg-white transition-all cursor-pointer bg-white/70">
                  <Eye className="w-3.5 h-3.5 text-[#5A6367]" />
                  <span>Inspect Grad-CAM</span>
                </button>
              </Magnet>

              <Magnet padding={40} magnetStrength={3} scale={1.03} tilt={6}>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_8px_20px_rgba(217,107,107,0.32)] transition-all cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Export Audit Report</span>
                </button>
              </Magnet>
            </div>
          </div>

          {/* Backend Offline Warning Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>FastAPI Backend Offline:</strong> Cannot connect to <code>{API_BASE_URL}</code>. Launch backend with: <code>uvicorn backend.main:app --port 8000</code>
                </span>
              </div>
              <button
                onClick={fetchAllData}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* =====================================================================
              ROW 1: FOUR STAT CARDS
              ===================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Corpus */}
            <div className="real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#788186] font-semibold uppercase">
                    TOTAL CORPUS
                  </span>
                  <span className="text-[10px] font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md font-semibold">
                    Verified
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-[#1E292E]">
                    {loading ? "..." : (datasetStats?.totalCorpus ? datasetStats.totalCorpus.toLocaleString() : "Not available")}
                  </span>
                  <span className="text-xs text-[#717A7F]">images</span>
                </div>
                <div className="text-[11px] text-[#717A7F] mt-1 font-mono">
                  Waterbirds Benchmark Split
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE3D5] flex items-center justify-between text-[10px] font-mono text-[#6A7378]">
                <span>{loading ? "..." : (datasetStats?.splits?.train ? datasetStats.splits.train.toLocaleString() : "Not available")} Train</span>
                <span>{loading ? "..." : (datasetStats?.splits?.validation ? datasetStats.splits.validation.toLocaleString() : "Not available")} Val</span>
                <span>{loading ? "..." : (datasetStats?.splits?.test ? datasetStats.splits.test.toLocaleString() : "Not available")} Test</span>
              </div>
            </div>

            {/* Card 2: Attribution Audit */}
            <div className="real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#788186] font-semibold uppercase">
                    ATTRIBUTION AUDIT
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-[#5A6367] border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                    Pending Run
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-mono font-bold text-[#717A7F]">Pending</div>
                    <div className="text-[11px] text-[#717A7F] mt-1 font-mono">Batch Saliency Mapping</div>
                  </div>
                  {/* Circular donut indicator */}
                  <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#B0B7BB] flex items-center justify-center font-mono text-[11px] font-bold text-[#717A7F]">
                    N/A
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE3D5] flex items-center justify-between text-[11px] font-mono text-[#6A7378]">
                <span>Test partition coverage</span>
                <span className="text-[#717A7F] font-bold">Not available</span>
              </div>
            </div>

            {/* Card 3: Baseline Accuracy */}
            <div className="real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#788186] font-semibold uppercase">
                    BASELINE ACCURACY
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-[#25333A] px-2 py-0.5 rounded-md font-semibold">
                    ERM Objective
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-[#1E292E]">{overallAccText}</span>
                  {metrics?.overallAccuracy !== undefined && metrics?.overallAccuracy !== null ? (
                    <span className="text-xs font-mono text-emerald-700 font-semibold">Evaluated</span>
                  ) : (
                    <span className="text-xs font-mono text-[#717A7F]">Pending</span>
                  )}
                </div>
                <div className="text-[11px] text-[#8C5252] mt-1 leading-snug">
                  Conceals catastrophic subgroup drops
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE3D5]">
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-[#EAE3D5] rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-[#1E292E] rounded-full transition-all duration-500" 
                    style={{ width: metrics?.overallAccuracy ? `${(metrics.overallAccuracy <= 1 ? metrics.overallAccuracy * 100 : metrics.overallAccuracy)}%` : "0%" }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#717A7E]">
                  <span>API Eval Batch: {evalSampleCount} samples</span>
                  <span>Test Partition: {loading ? "..." : (datasetStats?.splits?.test ? datasetStats.splits.test.toLocaleString() : "5,794")}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Shortcut Vulnerability */}
            <div className="real-glass-card rounded-2xl p-5 flex flex-col justify-between border-t-2 border-t-[#D96B6B] shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#C45252] font-semibold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D96B6B] animate-pulse" />
                    SHORTCUT VULNERABILITY
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-mono font-bold text-[#717A7F]">Pending</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-slate-100 text-[#5A6367] text-[10px] font-mono font-semibold">
                  <AlertCircle className="w-3 h-3 text-[#7A8287]" />
                  <span>Index not defined in backend</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE3D5] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6D757A]">Worst-Group Accuracy</span>
                <strong className="text-[#D96B6B] font-bold">{worstGroupAccText}</strong>
              </div>
            </div>
          </div>

          {/* =====================================================================
              ROW 2: MIDDLE SECTION (2 COLUMNS: SUBPOPULATION & 2x2 QUADRANTS)
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            
            {/* Left Card: Model Accuracy by Subpopulation (7 cols) */}
            <div className="lg:col-span-7 real-glass-board rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9195] font-semibold block">
                      EMPIRICAL DISPARITY
                    </span>
                    <h2 className="font-editorial text-2xl font-bold text-[#1E292E] mt-0.5">
                      Model Accuracy by Subpopulation
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-[#5A6367] border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                    Gap: Pending formal audit
                  </span>
                </div>

                {/* 4 Subpopulation Bars */}
                <div className="space-y-4 my-6">
                  {/* Subgroup 1: Waterbird on Water */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5 text-xs font-mono">
                      <span className="flex items-center gap-2 text-[#1E292E] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#1E292E]" />
                        Waterbird on Water <span className="text-[#7A8388] text-[11px]">(Majority Group • {getSubgroupCount(3)} test)</span>
                      </span>
                      <strong className="text-[#1E292E] font-bold">{getGroupAcc(3)}</strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1E292E] rounded-full transition-all duration-500" 
                        style={{ width: metrics?.groups?.find(g => g.id === 3)?.accuracy ? `${metrics.groups.find(g => g.id === 3)!.accuracy}%` : "0%" }} 
                      />
                    </div>
                  </div>

                  {/* Subgroup 2: Landbird on Land */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5 text-xs font-mono">
                      <span className="flex items-center gap-2 text-[#1E292E] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#1E292E]" />
                        Landbird on Land <span className="text-[#7A8388] text-[11px]">(Majority Group • {getSubgroupCount(0)} test)</span>
                      </span>
                      <strong className="text-[#1E292E] font-bold">{getGroupAcc(0)}</strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1E292E] rounded-full transition-all duration-500" 
                        style={{ width: metrics?.groups?.find(g => g.id === 0)?.accuracy ? `${metrics.groups.find(g => g.id === 0)!.accuracy}%` : "0%" }} 
                      />
                    </div>
                  </div>

                  {/* Subgroup 3: Waterbird on Land (Confounded Minority) */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5 text-xs font-mono">
                      <span className="flex items-center gap-2 text-[#B87A2E] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#B87A2E]" />
                        Waterbird on Land <span className="text-[#7A8388] text-[11px]">(Confounded Minority • {getSubgroupCount(2)} test)</span>
                      </span>
                      <strong className="text-[#B87A2E] font-bold">{getGroupAcc(2)}</strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#B87A2E] rounded-full transition-all duration-500" 
                        style={{ width: metrics?.groups?.find(g => g.id === 2)?.accuracy ? `${metrics.groups.find(g => g.id === 2)!.accuracy}%` : "0%" }} 
                      />
                    </div>
                  </div>

                  {/* Subgroup 4: Landbird on Water (Worst Group Confounded) */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5 text-xs font-mono">
                      <span className="flex items-center gap-2 text-[#D96B6B] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#D96B6B]" />
                        Landbird on Water <span className="text-[#7A8388] text-[11px]">(Worst Group Confounded • {getSubgroupCount(1)} test)</span>
                      </span>
                      <strong className="text-[#D96B6B] font-bold">{getGroupAcc(1)}</strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D96B6B] rounded-full transition-all duration-500" 
                        style={{ width: metrics?.groups?.find(g => g.id === 1)?.accuracy ? `${metrics.groups.find(g => g.id === 1)!.accuracy}%` : "0%" }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Finding Callout Box */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/80 bg-white/60 flex items-start gap-3 mt-4">
                <div className="w-7 h-7 rounded-lg bg-[#FCEBEA] flex items-center justify-center shrink-0 text-[#D96B6B]">
                  <BrainIcon className="w-4 h-4" />
                </div>
                <p className="text-xs text-[#525B60] leading-relaxed">
                  <strong className="text-[#1E292E] font-semibold">Diagnostic Finding: </strong>
                  The network acts as an environmental proxy. When test images superimpose landbirds against aqueous ripples or lakeside reeds, attention weights leak from avian plumage to surrounding water texture.
                </p>
              </div>
            </div>

            {/* Right Card: Correlation Topography (5 cols) */}
            <div className="lg:col-span-5 real-glass-board rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9195] font-semibold">
                    CORRELATION TOPOGRAPHY
                  </span>
                  <GitBranch className="w-4 h-4 text-[#7B8387]" />
                </div>
                <h2 className="font-editorial text-2xl font-bold text-[#1E292E] mb-1">
                  2×2 Confounding Quadrants
                </h2>
                <p className="text-xs text-[#6A7378] leading-relaxed mb-6">
                  Dataset distribution across species target and background context in the test partition.
                </p>

                {/* 2x2 Matrix Grid */}
                <div className="grid grid-cols-2 gap-3.5 mb-6">
                  {/* Top-Left: Water on Water (Group 3) */}
                  <div className="real-glass-card rounded-xl p-3.5 border border-white/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#6A7378]">WATER / WATER</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">{getSubgroupPct(3)}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#1E292E]">{getSubgroupCount(3)}</div>
                    <div className="text-[10px] font-mono text-[#788185]">Waterbird on Water</div>
                  </div>

                  {/* Top-Right: Water on Land (Group 2) */}
                  <div className="real-glass-card rounded-xl p-3.5 border border-[#F5CCCC] bg-[#FFF8F8] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#C45252]">WATER / LAND</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FCEBEA] text-[#C45252] font-bold">{getSubgroupPct(2)}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#D96B6B]">{getSubgroupCount(2)}</div>
                    <div className="text-[10px] font-mono text-[#8C5252]">Waterbird on Land</div>
                  </div>

                  {/* Bottom-Left: Land on Water (Group 1) */}
                  <div className="real-glass-card rounded-xl p-3.5 border border-[#F5CCCC] bg-[#FFF8F8] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#C45252]">LAND / WATER</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FCEBEA] text-[#C45252] font-bold">{getSubgroupPct(1)}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#D96B6B]">{getSubgroupCount(1)}</div>
                    <div className="text-[10px] font-mono text-[#8C5252]">Landbird on Water</div>
                  </div>

                  {/* Bottom-Right: Land on Land (Group 0) */}
                  <div className="real-glass-card rounded-xl p-3.5 border border-white/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#6A7378]">LAND / LAND</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">{getSubgroupPct(0)}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#1E292E]">{getSubgroupCount(0)}</div>
                    <div className="text-[10px] font-mono text-[#788185]">Landbird on Land</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE3D5] flex items-center justify-between text-[11px] font-mono text-[#737C81]">
                <span>Worst-Group Sample Size: <strong className="text-[#1E292E]">{getSubgroupCount(2)} imgs</strong></span>
                <span>Partition: <strong className="text-[#1E292E]">Test Split ({loading ? "..." : (datasetStats?.splits?.test ? datasetStats.splits.test.toLocaleString() : "5,794")} imgs)</strong></span>
              </div>
            </div>
          </div>

          {/* =====================================================================
              ROW 3: BOTTOM SECTION (ATTRIBUTION AUDIT LOG & COMPUTE TELEMETRY)
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            
            {/* Left Card: Attribution Audit Log Table (8 cols) */}
            <div className="lg:col-span-8 real-glass-board rounded-3xl p-6 sm:p-7 shadow-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9195] font-semibold block">
                    ATTRIBUTION AUDIT LOG
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#1E292E] mt-0.5">
                    Recent Inferences &amp; Feature Leak Alarms
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full real-glass-subcard text-[11px] font-mono text-emerald-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#EAE3D5] text-[10px] text-[#8C9498] uppercase">
                      <th className="pb-3 font-semibold">IMAGE SAMPLE</th>
                      <th className="pb-3 font-semibold">PREDICTION</th>
                      <th className="pb-3 font-semibold">GROUND TRUTH</th>
                      <th className="pb-3 font-semibold">CONF.</th>
                      <th className="pb-3 font-semibold">BACKGR. HEAT</th>
                      <th className="pb-3 font-semibold text-right">AUDIT VERDICT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE3D5]/60">
                    {/* Row 1: Heron on Water */}
                    <tr className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 border border-white/80">
                          <Image src="/images/hero_waterbird.jpg" alt="Sample 9821" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1E292E]">#WB-9821</div>
                          <div className="text-[10px] text-[#788185]">Heron / Lake</div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#1E292E] font-medium">Waterbird</td>
                      <td className="py-3.5 text-[#6D757A]">Waterbird</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span>98.4%</span>
                          <div className="w-10 h-1 bg-[#EAE3D5] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: "98.4%" }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#6D757A]">22%</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                          Robust
                        </span>
                      </td>
                    </tr>

                    {/* Row 2: Warbler on Water (Conflict!) */}
                    <tr className="hover:bg-white/40 transition-colors bg-[#FFF8F8]/50">
                      <td className="py-3.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 border border-[#F5CCCC]">
                          <Image src="/images/land_water.jpg" alt="Sample 4102" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1E292E]">#WB-4102</div>
                          <div className="text-[10px] text-[#C45252]">Warbler / River</div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#C45050] font-bold">Waterbird</td>
                      <td className="py-3.5 text-[#6D757A]">Landbird</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#C45050]">74.2%</span>
                          <div className="w-10 h-1 bg-[#EAE3D5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#D96B6B] rounded-full" style={{ width: "74.2%" }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#C45050] font-bold">79%</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#FCEBEA] text-[#C45252] border border-[#F5CCCC] text-[10px] font-semibold">
                          Spurious Shortcut
                        </span>
                      </td>
                    </tr>

                    {/* Row 3: Duck on Land (Conflict!) */}
                    <tr className="hover:bg-white/40 transition-colors bg-[#FFFDF5]/50">
                      <td className="py-3.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 border border-amber-200">
                          <Image src="/images/water_land.jpg" alt="Sample 1094" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1E292E]">#WB-1094</div>
                          <div className="text-[10px] text-amber-700">Duck / Grassland</div>
                        </div>
                      </td>
                      <td className="py-3.5 text-amber-700 font-bold">Landbird</td>
                      <td className="py-3.5 text-[#6D757A]">Waterbird</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-700">61.8%</span>
                          <div className="w-10 h-1 bg-[#EAE3D5] rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: "61.8%" }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-amber-700 font-bold">68%</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                          Context Confusion
                        </span>
                      </td>
                    </tr>

                    {/* Row 4: Waxwing on Land */}
                    <tr className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 border border-white/80">
                          <Image src="/images/hero_landbird.jpg" alt="Sample 6731" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1E292E]">#WB-6731</div>
                          <div className="text-[10px] text-[#788185]">Waxwing / Forest</div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#1E292E] font-medium">Landbird</td>
                      <td className="py-3.5 text-[#6D757A]">Landbird</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span>99.1%</span>
                          <div className="w-10 h-1 bg-[#EAE3D5] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: "99.1%" }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#6D757A]">14%</td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                          Robust
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Quick Navigation Links & Cluster Telemetry (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* 4 Quick Tool Shortcut Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dataset-explorer" className="real-glass-card rounded-2xl p-4 flex flex-col justify-between hover:bg-white/70 transition cursor-pointer group shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#7E878C] mb-2">
                      <Database className="w-4 h-4 text-[#1E292E]" />
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs font-bold text-[#1E292E]">Dataset Explorer</div>
                    <div className="text-[10px] text-[#788185] mt-0.5">Filter by context &amp; labels</div>
                  </div>
                </Link>

                <Link href="/grad-cam" className="real-glass-card rounded-2xl p-4 flex flex-col justify-between hover:bg-white/70 transition cursor-pointer group shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#7E878C] mb-2">
                      <Layers className="w-4 h-4 text-[#1E292E]" />
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs font-bold text-[#1E292E]">Grad-CAM Studio</div>
                    <div className="text-[10px] text-[#788185] mt-0.5">Layer4 feature gradients</div>
                  </div>
                </Link>

                <Link href="/perturbation-testing" className="real-glass-card rounded-2xl p-4 flex flex-col justify-between hover:bg-white/70 transition cursor-pointer group shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#7E878C] mb-2">
                      <Shuffle className="w-4 h-4 text-[#D96B6B]" />
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs font-bold text-[#1E292E]">Perturbation Lab</div>
                    <div className="text-[10px] text-[#788185] mt-0.5">Counterfactual synthesis</div>
                  </div>
                </Link>

                <Link href="/corrective-training" className="real-glass-card rounded-2xl p-4 flex flex-col justify-between hover:bg-white/70 transition cursor-pointer group shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[#7E878C] mb-2">
                      <Sliders className="w-4 h-4 text-[#D96B6B]" />
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs font-bold text-[#1E292E]">Group DRO Tuning</div>
                    <div className="text-[10px] text-[#788185] mt-0.5">Spurious bias mitigation</div>
                  </div>
                </Link>
              </div>

              {/* Compute Cluster Telemetry Card */}
              <div className="real-glass-card rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8388]">
                    COMPUTE CLUSTER TELEMETRY
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>

                {/* VRAM Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-mono text-[#6A7378] mb-1">
                    <span>VRAM Allocation (NVIDIA RTX 4090)</span>
                    <strong className="text-[#1E292E]">18.4 / 24 GB (76%)</strong>
                  </div>
                  <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#25333A] to-[#D96B6B] rounded-full" style={{ width: "76%" }} />
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="pt-3 border-t border-[#EAE3D5] grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#8C9498] block">Batch Latency</span>
                    <strong className="text-[#1E292E]">14.2 ms / frame</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C9498] block">Active Optimizer</span>
                    <strong className="text-[#1E292E]">AdamW (lr=1e-4)</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

// Icon helper for diagnostic callout
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
    </svg>
  );
}
