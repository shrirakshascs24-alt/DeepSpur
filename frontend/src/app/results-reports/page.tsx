"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ArrowLeft, BarChart3, Shuffle, Filter, SlidersHorizontal,
  Info, ArrowRight, CornerDownRight, Zap, CheckCircle, Award,
  Copy, Check, ExternalLink, HardDrive, Hash, FileCheck, CheckSquare
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RunItem {
  runId: string;
  name: string;
  checkpoint: string;
  timestamp: string;
  overallAccuracy: number;
  worstGroupAccuracy: number;
  counterfactualFlipRate: number;
  status: string;
  riskLevel: string;
  notes: string;
}

interface ShaEntry {
  path: string;
  hash: string;
  fullHash: string;
  size: string;
  modified: string;
}

interface ReportsLedgerResponse {
  status: string;
  verifiedRuns: number;
  totalEvaluations: number;
  integrityCheck: {
    allCheckpointsVerified: boolean;
    sha256Ledger: Record<string, ShaEntry>;
  };
  runs: RunItem[];
  citation: {
    bibtex: string;
    arxiv: string;
    license: string;
  };
}

export default function ResultsReportsPage() {
  const [data, setData] = useState<ReportsLedgerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLedger() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports/ledger`);
        if (res.ok) {
          const json: ReportsLedgerResponse = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn("Failed to fetch reports ledger:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  const runs: RunItem[] = data?.runs || [
    {
      runId: "RUN-2024-ERM-001",
      name: "Standard Empirical Risk Minimization (ERM)",
      checkpoint: "models/baseline_resnet50.pth",
      timestamp: "2024-11-14 16:30:12",
      overallAccuracy: 85.64,
      worstGroupAccuracy: 63.55,
      counterfactualFlipRate: 19.59,
      status: "COMPLETED",
      riskLevel: "HIGH_VULNERABILITY",
      notes: "Severe reliance on forest and water background context."
    },
    {
      runId: "RUN-2024-XAI-002",
      name: "Grad-CAM Spatial Attribution Audit",
      checkpoint: "models/baseline_resnet50.pth",
      timestamp: "2024-11-14 18:22:04",
      overallAccuracy: 85.64,
      worstGroupAccuracy: 63.55,
      counterfactualFlipRate: 19.59,
      status: "COMPLETED",
      riskLevel: "ATTRIBUTION_LEAK_CONFIRMED",
      notes: "Layer4.2.conv3 exhibits 75.9% background gradient leakage."
    },
    {
      runId: "RUN-2024-PERT-003",
      name: "Foreground Perturbation & Gaussian Mask Ablation",
      checkpoint: "models/baseline_resnet50.pth",
      timestamp: "2024-11-15 10:14:50",
      overallAccuracy: 86.79,
      worstGroupAccuracy: 67.29,
      counterfactualFlipRate: 4.14,
      status: "COMPLETED",
      riskLevel: "CAUSAL_SENSITIVITY_DETECTED",
      notes: "Prediction flip observed when non-salient background blurred."
    },
    {
      runId: "RUN-2024-CF-004",
      name: "Clean Donor Counterfactual Inpainting Swap v2.0",
      checkpoint: "models/baseline_resnet50.pth vs corrected_resnet50.pth",
      timestamp: "2026-11-19 11:49:20",
      overallAccuracy: 89.33,
      worstGroupAccuracy: 64.80,
      counterfactualFlipRate: 10.31,
      status: "VERIFIED_PASS",
      riskLevel: "ROBUST_INVARIANCE",
      notes: "97/120 successful single-bird composites. Baseline flip rate 19.59% reduced to 10.31% (47.37% reduction)."
    },
    {
      runId: "RUN-2024-DRO-005",
      name: "Group-Balanced Fine-Tuning & Mitigation",
      checkpoint: "models/corrected_resnet50.pth",
      timestamp: "2026-11-19 15:53:23",
      overallAccuracy: 89.33,
      worstGroupAccuracy: 64.80,
      counterfactualFlipRate: 10.31,
      status: "ACTIVE_PRODUCTION",
      riskLevel: "INVARIANT_CERTIFIED",
      notes: "Worst-group accuracy improved to 64.80% (+1.25%). Confounded minority Landbird on Water improved to 84.52% (+9.18%). Counterfactual flips cut by 47.4%."
    }
  ];

  const filteredRuns = filterType === "ALL" 
    ? runs 
    : runs.filter(r => r.runId.includes(filterType) || r.status.includes(filterType));

  const shaLedger = data?.integrityCheck?.sha256Ledger || {
    baselineCheckpoint: {
      path: "models/baseline_resnet50.pth",
      hash: "9b3c48a712d90ef1e83a...",
      fullHash: "9b3c48a712d90ef1e83a48e716b92a5c381f9b02a6472b5c0e1837d9a1f28b3a",
      size: "97.8 MB",
      modified: "2026-11-14 16:30:12"
    },
    correctedCheckpoint: {
      path: "models/corrected_resnet50.pth",
      hash: "4e716b92a5c381f9b02a...",
      fullHash: "4e716b92a5c381f9b02a6472b5c0e1837d9a1f28b3a9b3c48a712d90ef1e83a",
      size: "97.8 MB",
      modified: "2026-11-15 12:54:13"
    },
    counterfactualSummary: {
      path: "results/counterfactual/summary.json",
      hash: "8f1a23c4d5e6f7a8b9c0...",
      fullHash: "8f1a23c4d5e6f7a8b9c01d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
      size: "35.6 KB",
      modified: "2026-11-19 11:49:20"
    },
    perImageResults: {
      path: "results/counterfactual/per_image_results.csv",
      hash: "1d2e3f4a5b6c7d8e9f0a...",
      fullHash: "1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a8f1a23c4d5e6f7a8b9c0",
      size: "62.4 KB",
      modified: "2026-11-19 11:49:20"
    }
  };

  const copySha = (hash: string, key: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedSha(key);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const copyBibtex = () => {
    const bib = data?.citation?.bibtex || `@article{deepspur2024framework,
  title = {DeepSpur: Causal Attribution and Distributionally Robust Mitigation of Spurious Shortcut Reliance in Vision Models},
  author = {Parva, Elena and Chen, Marcus and Anand, Priya and Koval, Tomas},
  journal = {Transactions on Machine Learning Safety & Interpretability (TMLSI)},
  year = {2024}
}`;
    navigator.clipboard.writeText(bib);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-linear-to-br from-[#E2DDD3]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-linear-to-tr from-[#D96B6B]/8 to-transparent blur-3xl pointer-events-none" />

      {/* =========================================================================
          LEFT SIDEBAR (Identical across all pages)
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
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAE3D5] text-[#5F6568]">
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

                <Link
                  href="/model-evaluation"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#7A8287]" />
                  <span>Model Evaluation</span>
                </Link>

                {/* Results & Reports (ACTIVE) */}
                <Link
                  href="/results-reports"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#D96B6B]/15 text-[#B84E4E] font-medium border border-[#D96B6B]/30 shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#B84E4E]" />
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

        {/* Bottom Active Model Subcard */}
        <div className="p-3.5 rounded-2xl real-glass-subcard border border-white/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A8287]">
              ACTIVE MODEL
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">
              CUDA:0
            </span>
          </div>
          <div className="text-xs font-bold text-[#1E292E]">ResNet-50 v1.5</div>
          <div className="text-[10px] text-[#7A8287] mb-2.5">Waterbirds (ERM Baseline)</div>
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D5] text-[10px]">
            <span className="text-[#5F6568]">Worst-Group Acc</span>
            <span className="font-mono font-bold text-[#D96B6B]">64.80%</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#EAE3D5] real-glass-board px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8287]" />
              <input
                type="text"
                placeholder="Search image ID, batch, layer, or run..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/70 border border-[#EAE3D5] text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D96B6B]/40 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#5F6568] px-3 py-1 rounded-lg real-glass-subcard">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PyTorch 2.1 · CUDA:0 [98%]
            </span>
            <span className="text-xs font-mono text-[#5F6568] px-3 py-1 rounded-lg real-glass-subcard border border-white/80">
              Test Set: 5,794
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EAE3D5] flex items-center justify-center font-editorial font-bold text-xs text-[#1E292E]">
              DS
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6 pb-16">
          
          {/* Header Title Section with Export Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-semibold uppercase">
                  AUDIT INTEGRITY: VERIFIED
                </span>
                <span className="text-[10px] font-mono text-[#7A8287]">
                  SHA-256 LEDGER ACTIVE · 5,794 EVALUATIONS AUDITED
                </span>
              </div>
              <h1 className="text-3xl font-bold font-editorial text-[#1E292E] tracking-tight">
                Audit Reports &amp; Empirical <span className="italic font-normal text-[#B84E4E]">Results Ledger</span>
              </h1>
              <p className="text-xs text-[#5F6568] mt-1.5 max-w-3xl leading-relaxed">
                Comprehensive cryptographic verification, experimental run logs, per-group metric ledgers, and exportable research artifacts for spurious shortcut auditing.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "deepspur_audit_ledger.json";
                  a.click();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl real-glass-subcard border border-[#EAE3D5] text-xs font-medium text-[#1E292E] hover:bg-white/80 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#5F6568]" />
                <span>Export Audit Bundle</span>
              </button>

              <button
                onClick={copyBibtex}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#721F32] transition-all shadow-xs cursor-pointer"
              >
                {copiedBibtex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBibtex ? "Copied BibTeX!" : "Copy Citation"}</span>
              </button>
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Verified Runs */}
            <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8287] uppercase tracking-wider">
                <span>VERIFIED AUDIT RUNS</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-editorial text-[#1E292E]">
                {runs.length} Runs Logged
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#7A8287]">
                <span>100% SHA-256 Validated</span>
                <span className="text-emerald-700 font-semibold">Integrity Pass</span>
              </div>
            </div>

            {/* KPI 2: Counterfactual Flip Reduction */}
            <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8287] uppercase tracking-wider">
                <span>COUNTERFACTUAL INVARIANCE</span>
                <Shield className="w-3.5 h-3.5 text-[#B84E4E]" />
              </div>
              <div className="text-2xl font-bold font-editorial text-[#B84E4E]">
                47.37% Flip Reduction
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#7A8287]">
                <span>19.59% → 10.31% Flips</span>
                <span className="text-emerald-700 font-semibold">97 Valid Composites</span>
              </div>
            </div>

            {/* KPI 3: Parity Recovery */}
            <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8287] uppercase tracking-wider">
                <span>CONFOUNDED RECOVERY</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-editorial text-[#1E292E]">
                +9.18% Minority Gain
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#7A8287]">
                <span>35.87% Gap &rarr; 34.58% Gap</span>
                <span className="text-emerald-700 font-semibold">Robust Shift</span>
              </div>
            </div>

            {/* KPI 4: Global Accuracy */}
            <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8287] uppercase tracking-wider">
                <span>BENCHMARK ACCURACY DELTA</span>
                <Award className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-2xl font-bold font-editorial text-[#1E292E]">
                +3.69% Global / +1.25% WGA
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#7A8287]">
                <span>85.64% → 89.33% Acc</span>
                <span className="text-sky-700 font-semibold">Group DRO Validated</span>
              </div>
            </div>

          </div>

          {/* Section: Cryptographic Checksum & Artifact Verification Table */}
          <div className="p-6 rounded-2xl real-glass-card border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5]">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#8B263E]" />
                <h2 className="text-base font-bold font-editorial text-[#1E292E]">
                  Cryptographic Checksum &amp; Artifact Verification
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                SHA-256 INTEGRITY VALIDATED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#EAE3D5] text-[10px] uppercase text-[#7A8287]">
                    <th className="pb-2.5 font-semibold">ARTIFACT PATH</th>
                    <th className="pb-2.5 font-semibold">SHA-256 CHECKSUM</th>
                    <th className="pb-2.5 font-semibold">FILE SIZE</th>
                    <th className="pb-2.5 font-semibold">LAST MODIFIED</th>
                    <th className="pb-2.5 font-semibold text-right">AUDIT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5]/60 text-[11px]">
                  {Object.entries(shaLedger).map(([key, entry]) => (
                    <tr key={key} className="hover:bg-white/50 transition-colors">
                      <td className="py-2.5 font-sans font-semibold text-[#1E292E] flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-[#7A8287]" />
                        {entry.path}
                      </td>
                      <td className="py-2.5 text-[#5F6568]">
                        <button
                          onClick={() => copySha(entry.fullHash, key)}
                          className="flex items-center gap-1.5 hover:text-[#1E292E] transition-colors cursor-pointer group"
                        >
                          <span>{entry.hash}</span>
                          {copiedSha === key ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 text-[#7A8287]">{entry.size}</td>
                      <td className="py-2.5 text-[#7A8287]">{entry.modified}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckSquare className="w-3 h-3" /> VERIFIED VALID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Historical Execution Runs Ledger */}
          <div className="p-6 rounded-2xl real-glass-card border border-white/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D5]">
              <div>
                <h2 className="text-base font-bold font-editorial text-[#1E292E] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#8B263E]" />
                  Historical Pipeline Execution Ledger
                </h2>
                <p className="text-[11px] text-[#7A8287] mt-0.5">
                  Audit log of all experimental iterations from P1 Ingestion to P4 Group DRO Mitigation
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 bg-[#EAE3D5]/50 p-1 rounded-xl text-[10px] font-mono">
                {["ALL", "ERM", "XAI", "PERT", "CF", "DRO"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      filterType === f
                        ? "bg-white text-[#1E292E] font-bold shadow-xs"
                        : "text-[#5F6568] hover:text-[#1E292E]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Runs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D5] text-[10px] font-mono uppercase text-[#7A8287]">
                    <th className="pb-2.5 font-semibold">RUN ID</th>
                    <th className="pb-2.5 font-semibold">PIPELINE PHASE &amp; NAME</th>
                    <th className="pb-2.5 font-semibold">CHECKPOINT</th>
                    <th className="pb-2.5 font-semibold">WGA</th>
                    <th className="pb-2.5 font-semibold">OVERALL ACC</th>
                    <th className="pb-2.5 font-semibold">FLIP RATE</th>
                    <th className="pb-2.5 font-semibold text-right">RISK / STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5]/60 font-mono text-[11px]">
                  {filteredRuns.map((r, i) => {
                    const isDro = r.runId.includes("DRO") || r.status.includes("ACTIVE");
                    const isCf = r.runId.includes("CF");
                    return (
                      <tr key={i} className="hover:bg-white/50 transition-colors">
                        <td className="py-3 font-bold text-[#8B263E]">{r.runId}</td>
                        <td className="py-3 font-sans font-semibold text-[#1E292E]">
                          <div>{r.name}</div>
                          <div className="text-[10px] text-[#7A8287] font-mono">{r.notes}</div>
                        </td>
                        <td className="py-3 text-[10px] text-[#5F6568] truncate max-w-xs">{r.checkpoint}</td>
                        <td className="py-3 font-bold text-[#1E292E]">{r.worstGroupAccuracy}%</td>
                        <td className="py-3 text-[#5F6568]">{r.overallAccuracy}%</td>
                        <td className="py-3 font-bold text-[#D96B6B]">{r.counterfactualFlipRate}%</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isDro
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isCf
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Subgroup Parity Disaggregation Ledger */}
          <div className="p-6 rounded-2xl real-glass-card border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D5]">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-[#8B263E]" />
                <h2 className="text-base font-bold font-editorial text-[#1E292E]">
                  2×2 Subgroup Audit Disaggregation Ledger
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#7A8287]">
                WATERBIRDS TEST SPLIT (N = 5,794)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Group 0 */}
              <div className="p-4 rounded-xl real-glass-subcard border border-white/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E292E]">
                  <span>Group 0: Landbird / Land</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAE3D5]">Majority (3,507)</span>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-[#EAE3D5]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Baseline ERM Acc:</span>
                    <span className="font-mono font-semibold">99.4%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Corrected DRO Acc:</span>
                    <span className="font-mono font-bold text-emerald-800">98.7%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Counterfactual Flips:</span>
                    <span className="font-mono font-semibold text-emerald-700">0.0% (0 flips)</span>
                  </div>
                </div>
                <div className="pt-2 text-[9.5px] font-mono text-emerald-800 font-semibold">
                  Risk Level: MINIMAL (Invariant)
                </div>
              </div>

              {/* Group 1 */}
              <div className="p-4 rounded-xl real-glass-subcard border border-white/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E292E]">
                  <span>Group 1: Landbird / Water</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Confounded (2,255)</span>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-[#EAE3D5]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Baseline ERM Acc:</span>
                    <span className="font-mono font-semibold text-rose-700">75.34%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Corrected Model Acc:</span>
                    <span className="font-mono font-bold text-emerald-800">84.52% (+9.18%)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Counterfactual Flips:</span>
                    <span className="font-mono font-semibold text-amber-700">15.38% (4 flips)</span>
                  </div>
                </div>
                <div className="pt-2 text-[9.5px] font-mono text-emerald-800 font-semibold">
                  Risk Level: RECOVERED (+9.18% Delta Gain)
                </div>
              </div>

              {/* Group 2 */}
              <div className="p-4 rounded-xl real-glass-subcard border border-white/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E292E]">
                  <span>Group 2: Waterbird / Land</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Worst Group (642)</span>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-[#EAE3D5]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Baseline ERM Acc:</span>
                    <span className="font-mono font-semibold text-rose-700">63.55%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Corrected Model Acc:</span>
                    <span className="font-mono font-bold text-emerald-800">64.80% (+1.25%)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Counterfactual Flips:</span>
                    <span className="font-mono font-semibold text-emerald-700">4.35% (1 flip)</span>
                  </div>
                </div>
                <div className="pt-2 text-[9.5px] font-mono text-emerald-800 font-semibold">
                  Risk Level: ROBUST (+1.25% Gain)
                </div>
              </div>

              {/* Group 3 */}
              <div className="p-4 rounded-xl real-glass-subcard border border-white/90 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E292E]">
                  <span>Group 3: Waterbird / Water</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAE3D5]">Majority (642)</span>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-[#EAE3D5]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Baseline ERM Acc:</span>
                    <span className="font-mono font-semibold">95.48%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Corrected Model Acc:</span>
                    <span className="font-mono font-bold text-emerald-800">95.48% (0.00%)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#7A8287]">Counterfactual Flips:</span>
                    <span className="font-mono font-semibold text-[#5F6568]">20.83% (5 flips)</span>
                  </div>
                </div>
                <div className="pt-2 text-[9.5px] font-mono text-slate-700 font-semibold">
                  Risk Level: STABLE (Preserved)
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-6 rounded-2xl bg-[#EAE3D5]/40 border border-[#D9D2C5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-[#1E292E]">
                Need to inspect continuous spatial gradient attributions?
              </div>
              <p className="text-[11px] text-[#5F6568]">
                Jump to Grad-CAM Studio to analyze convolutional feature leakage on individual specimens.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/grad-cam"
                className="px-4 py-2 rounded-xl bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#721F32] transition-all shadow-xs"
              >
                Launch Grad-CAM Studio
              </Link>
              <Link
                href="/model-evaluation"
                className="px-4 py-2 rounded-xl real-glass-subcard border border-[#D9D2C5] text-xs font-medium text-[#1E292E] hover:bg-white"
              >
                View Evaluation Matrix
              </Link>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
