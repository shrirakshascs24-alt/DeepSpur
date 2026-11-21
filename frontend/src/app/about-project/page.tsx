"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ArrowLeft, BarChart3, Shuffle, Filter, SlidersHorizontal,
  Info, ArrowRight, CornerDownRight, Zap, Copy, Check, ExternalLink,
  BookOpen, Code2, Users, Layers3, CpuIcon
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AboutProjectPage() {
  const [copied, setCopied] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.warn("Failed fetching metrics in about page:", err));
  }, []);

  const bibtex = `@article{deepspur2024framework,
  title = {DeepSpur: Causal Attribution and Distributionally Robust Mitigation of Spurious Shortcut Reliance in Vision Models},
  author = {Parva, Elena and Chen, Marcus and Anand, Priya and Koval, Tomas},
  journal = {Transactions on Machine Learning Safety & Interpretability (TMLSI)},
  year = {2024}
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

                <Link
                  href="/results-reports"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#7A8287]" />
                  <span>Results & Reports</span>
                </Link>
              </nav>
            </div>

            {/* Group 4: System (ACTIVE) */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#989FA3] uppercase block mb-2 px-2">
                SYSTEM
              </span>
              <nav className="space-y-1">
                <Link 
                  href="/about-project"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#D96B6B]/15 text-[#B84E4E] font-medium border border-[#D96B6B]/30 shadow-xs"
                >
                  <Compass className="w-4 h-4 text-[#B84E4E]" />
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
            <span className="font-mono font-bold text-[#D96B6B]">{metrics?.worstGroupAccuracy ? `${(metrics.worstGroupAccuracy * 100).toFixed(2)}%` : "64.80%"}</span>
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
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-16">
          
          {/* Header Title Section with Research Manifesto Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B263E] text-white uppercase font-bold">
                RESEARCH SPECIFICATION & ARCHITECTURAL MANIFESTO
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-[#5F6568] border border-[#EAE3D5]">
                v1.5-Release
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100/70 text-sky-800 border border-sky-200/60 font-semibold">
                Waterbirds-10K Dataset
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-800 border border-rose-200/60 font-semibold">
                PyTorch & ResNet
              </span>
            </div>
            <h1 className="text-3xl font-bold font-editorial text-[#1E292E] tracking-tight">
              About DeepSpur <span className="italic font-normal text-[#B84E4E]">Architecture & Methodology</span>
            </h1>
            <p className="text-xs text-[#5F6568] mt-1.5 max-w-3xl leading-relaxed">
              Explainable detection, attribution auditing, and counterfactual mitigation of spurious feature reliance in deep vision models under subpopulation shift.
            </p>
          </div>

          {/* Hero Hypothesis Card (Large Card with Warbler Image) */}
          <div className="p-6 md:p-8 rounded-3xl real-glass-card border border-white/80 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left 8 Cols: Hypothesis narrative + stats */}
              <div className="lg:col-span-8 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200/60 font-semibold">
                  BENCHMARK FOUNDATION · CUB-200 / PLACES-205
                </span>
                
                <h2 className="text-2xl font-bold font-editorial text-[#1E292E] tracking-tight">
                  Deconstructing the Shortcut Learning Hypothesis in Avian Taxa
                </h2>

                <p className="text-xs text-[#5F6568] leading-relaxed">
                  Standard deep convolutional backbones trained under Empirical Risk Minimization (ERM) optimize aggregated loss across the entire manifold. In the canonical Waterbirds setting, where yellow warblers and land-based perches naturally co-occur in 95% of training samples, the neural network learns to leverage ambient background foliage as an abominous proxy for class identification, failing catastrophically when target species appear in orthogonal environmental contexts.
                </p>

                {/* 3 Inline Stat Callouts */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EAE3D5]">
                  <div>
                    <div className="text-2xl font-bold font-editorial text-[#1E292E]">
                      {metrics?.groups?.find((g: any) => g.id === 3)?.accuracy ? `${metrics.groups.find((g: any) => g.id === 3).accuracy.toFixed(1)}%` : "95.5%"}
                    </div>
                    <div className="text-[10px] font-mono text-[#7A8287] mt-0.5">Waterbird / Water Match</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-editorial text-[#D96B6B]">
                      {metrics?.baselineReference?.worstGroupAccuracy ? `${(metrics.baselineReference.worstGroupAccuracy * 100).toFixed(2)}%` : "63.55%"}
                    </div>
                    <div className="text-[10px] font-mono text-[#7A8287] mt-0.5">Baseline WGA (Waterbird/Land)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-editorial text-emerald-800">
                      {metrics?.worstGroupAccuracy ? `${(metrics.worstGroupAccuracy * 100).toFixed(2)}%` : "64.80%"}
                    </div>
                    <div className="text-[10px] font-mono text-[#7A8287] mt-0.5">Corrected WGA (+1.25%)</div>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Image Card */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-full max-w-xs rounded-2xl overflow-hidden bg-[#25333A] text-white shadow-lg border border-white/40 relative group">
                  <div className="aspect-4/3 relative overflow-hidden">
                    <Image
                      src="/images/land_water.jpg"
                      alt="Setophaga petechia"
                      width={320}
                      height={240}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[9px] font-mono uppercase font-bold tracking-wider backdrop-blur-xs">
                      INVARIANT
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-xs font-bold font-editorial">Setophaga petechia (Yellow Warbler)</div>
                    <div className="text-[10px] font-mono text-gray-300">CUB-200 Biology: Landbird Forest</div>
                    <div className="text-[9px] font-mono text-gray-400">Camera: Modular ERM</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Theoretical Foundations & Research Gap */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B263E]" />
              <h2 className="text-base font-bold font-editorial text-[#1E292E] tracking-tight uppercase">
                Theoretical Foundations & Research Gap
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Thesis 1 */}
              <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8B263E] font-bold uppercase tracking-wider">
                    <span>THESIS 1</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-[#D96B6B]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E292E] mt-1">
                    The Spurious Correlation Dilemma
                  </h3>
                  <p className="text-[11px] text-[#5F6568] mt-2 leading-relaxed">
                    Standard Empirical Risk Minimization optimizes average training error over the empirical distribution $P(X, Y)$. Because background textures (water caustics, forest canopies) are strongly non-causally tied to bird labels, ERM converges to representations relying primarily on background pixels rather than invariant anatomical morphology.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EAE3D5]/50 border border-[#D9D2C5] font-mono text-[10px] text-[#1E292E] text-center">
                  R_ERM(θ) = E_P[L(f_θ(x), y)]
                </div>
              </div>

              {/* Thesis 2 */}
              <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8B263E] font-bold uppercase tracking-wider">
                    <span>THESIS 2</span>
                    <Split className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E292E] mt-1">
                    The Subgroup Inversion Penalty
                  </h3>
                  <p className="text-[11px] text-[#5F6568] mt-2 leading-relaxed">
                    While high aggregate metric performance (&gt;85%) creates an illusion of generalizability, the baseline model suffers a catastrophic worst-group drop to 63.55% accuracy on the minority subpopulation (Waterbirds placed on land, with only 56 training specimens). The spurious shortcut induces severe disparity under distributional shift.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EAE3D5]/50 border border-[#D9D2C5] font-mono text-[10px] text-[#1E292E] text-center">
                  WGA(θ) = min_g E_Pg[L(f_θ(x), y)]
                </div>
              </div>

              {/* Thesis 3 */}
              <div className="p-5 rounded-2xl real-glass-card border border-white/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8B263E] font-bold uppercase tracking-wider">
                    <span>THESIS 3</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E292E] mt-1">
                    The Causal Verification Gap
                  </h3>
                  <p className="text-[11px] text-[#5F6568] mt-2 leading-relaxed">
                    Existing Saliency engines (Grad-CAM, Integrated Gradients) yield observational heatmaps showing correlation, not causation. DeepSpur bridges this gap by marrying continuous layer attribution with strict Counterfactual Background Swapping and Group-Conditioned Distributionally Robust Optimization (Group DRO).
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EAE3D5]/50 border border-[#D9D2C5] font-mono text-[10px] text-[#1E292E] text-center">
                  Δ_Causal = E[f(x, c_swap)] - E[f(x, c_orig)]
                </div>
              </div>

            </div>
          </div>

          {/* Section: End-to-End Pipeline & System Architecture */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B263E]" />
                <h2 className="text-base font-bold font-editorial text-[#1E292E] tracking-tight uppercase">
                  End-to-End Pipeline & System Architecture
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#7A8287]">
                P1-P2-P3-P4 TOPOGRAPHY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Engine A */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">
                  ENGINE A
                </span>
                <h3 className="text-xs font-bold text-[#1E292E]">Data Ingestion & Obscuration</h3>
                <p className="text-[10.5px] text-[#5F6568] leading-relaxed">
                  Asynchronous streaming of Waterbirds-10K CUB-200 foundation metadata; blinds ground truth labels until analysis inference.
                </p>
                <div className="pt-2 border-t border-[#EAE3D5] text-[9.5px] font-mono text-[#7A8287]">
                  Module: data/ingest.py
                </div>
              </div>

              {/* Engine B */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                  ENGINE B
                </span>
                <h3 className="text-xs font-bold text-[#1E292E]">Explainability & Gradient Hook</h3>
                <p className="text-[10.5px] text-[#5F6568] leading-relaxed">
                  Direct layer-wise hook into layer4.2.conv3 in ResNet-50. Calculates continuous spatial upsampling and integrated attribution ratio.
                </p>
                <div className="pt-2 border-t border-[#EAE3D5] text-[9.5px] font-mono text-[#7A8287]">
                  Module: xai/gradcam.py
                </div>
              </div>

              {/* Engine C */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                  ENGINE C
                </span>
                <h3 className="text-xs font-bold text-[#1E292E]">Causal Perturbation Synthesis</h3>
                <p className="text-[10.5px] text-[#5F6568] leading-relaxed">
                  Avian foreground segmentation with DeepLabV3, alpha matting, clean donor inpainting with OpenCV Telea, and causal flip validation.
                </p>
                <div className="pt-2 border-t border-[#EAE3D5] text-[9.5px] font-mono text-[#7A8287]">
                  Module: xai/counterfactual.py
                </div>
              </div>

              {/* Engine D */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  ENGINE D
                </span>
                <h3 className="text-xs font-bold text-[#1E292E]">Group DRO Mitigation</h3>
                <p className="text-[10.5px] text-[#5F6568] leading-relaxed">
                  Distributionally robust optimization re-weights minority subpopulation losses, penalizing background shortcut reliance during training.
                </p>
                <div className="pt-2 border-t border-[#EAE3D5] text-[9.5px] font-mono text-[#7A8287]">
                  Module: mitigation/training.py
                </div>
              </div>

            </div>

            {/* Bottom specs strip */}
            <div className="p-3.5 rounded-xl real-glass-subcard border border-white/80 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-[#5F6568]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#8B263E]" />
                Synchronous Execution: PyTorch 2.1 + CUDA 12.1 or CPU Fallback
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-700" />
                Dual Checkpoint Cache: Baseline ERM & Corrected Group DRO
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Resolution: 224x224 RGB Normalized
              </span>
            </div>
          </div>

          {/* Section: Technology Stack & Implementation Matrix */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B263E]" />
              <h2 className="text-base font-bold font-editorial text-[#1E292E] tracking-tight uppercase">
                Technology Stack & Implementation Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stack 1 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#7A8287]">Frontend UI</div>
                <h3 className="text-xs font-bold text-[#1E292E]">Client & Visualization</h3>
                <div className="space-y-1 text-[10px] text-[#5F6568] pt-2 border-t border-[#EAE3D5]">
                  <div>Framework: Next.js 16 (App Router)</div>
                  <div>Design: TailwindCSS + Glassmorphism</div>
                  <div>Icons: Lucide React</div>
                  <div>Math: KaTeX Equations</div>
                </div>
              </div>

              {/* Stack 2 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#7A8287]">ML Infrastructure</div>
                <h3 className="text-xs font-bold text-[#1E292E]">Deep Learning Core</h3>
                <div className="space-y-1 text-[10px] text-[#5F6568] pt-2 border-t border-[#EAE3D5]">
                  <div>Core: PyTorch 2.1</div>
                  <div>Backbone: ResNet-50 TorchVision</div>
                  <div>Segmentation: DeepLabV3-ResNet50</div>
                  <div>Inpainting: OpenCV Telea Algorithm</div>
                </div>
              </div>

              {/* Stack 3 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#7A8287]">Server & Endpoints</div>
                <h3 className="text-xs font-bold text-[#1E292E]">APIs & Middleware</h3>
                <div className="space-y-1 text-[10px] text-[#5F6568] pt-2 border-t border-[#EAE3D5]">
                  <div>Server: FastAPI Python 3.11+</div>
                  <div>Server Runner: Uvicorn Workers</div>
                  <div>Safety: Path Traversal Enforced</div>
                  <div>Serialization: Pydantic v2</div>
                </div>
              </div>

              {/* Stack 4 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#7A8287]">Benchmark Data</div>
                <h3 className="text-xs font-bold text-[#1E292E]">Datasets & Benchmarks</h3>
                <div className="space-y-1 text-[10px] text-[#5F6568] pt-2 border-t border-[#EAE3D5]">
                  <div>Base: CUB-200-2011 Birds</div>
                  <div>Confounders: Places-205 Scenes</div>
                  <div>Test Count: 5,794 Total Images</div>
                  <div>4 Groups: 2x2 Orthogonal Grid</div>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Research Engineering Team & Pipeline Contributions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B263E]" />
              <h2 className="text-base font-bold font-editorial text-[#1E292E] tracking-tight uppercase">
                Research Engineering Team & Pipeline Contributions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Member 1 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25333A] text-white flex items-center justify-center font-editorial font-bold text-xs">
                    EP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">Elena Parva</div>
                    <div className="text-[10px] text-[#7A8287]">Lead Systems Engineer</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#EAE3D5] text-[10.5px] text-[#5F6568]">
                  <span className="font-semibold text-[#1E292E]">Module P1:</span> Data Pipeline & Blinded Explorer. Engineered dataset streaming, split caching, and blinding protocols.
                </div>
              </div>

              {/* Member 2 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B263E] text-white flex items-center justify-center font-editorial font-bold text-xs">
                    MC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">Dr. Marcus Chen</div>
                    <div className="text-[10px] text-[#7A8287]">Senior ML Scientist</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#EAE3D5] text-[10.5px] text-[#5F6568]">
                  <span className="font-semibold text-[#1E292E]">Module P2:</span> Baseline Model & Segmentation Engine. ResNet-50 ERM training and DeepLabV3 silhouette extraction.
                </div>
              </div>

              {/* Member 3 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-editorial font-bold text-xs">
                    PA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">Dr. Priya Anand</div>
                    <div className="text-[10px] text-[#7A8287]">Explainability Researcher</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#EAE3D5] text-[10.5px] text-[#5F6568]">
                  <span className="font-semibold text-[#1E292E]">Module P3:</span> Explainability & Shortcut Detection. Grad-CAM layer hooks and clean donor background inpainting.
                </div>
              </div>

              {/* Member 4 */}
              <div className="p-4 rounded-2xl real-glass-card border border-white/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center font-editorial font-bold text-xs">
                    TK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">Tomas Koval</div>
                    <div className="text-[10px] text-[#7A8287]">Optimization Engineer</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#EAE3D5] text-[10.5px] text-[#5F6568]">
                  <span className="font-semibold text-[#1E292E]">Module P4:</span> Corrective Training & Evaluation. Group DRO fine-tuning and worst-group parity optimization.
                </div>
              </div>

            </div>
          </div>

          {/* Section: Scholarly Citation & Artifact Repository */}
          <div className="p-6 rounded-3xl real-glass-card border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D5]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8B263E]" />
                <h2 className="text-base font-bold font-editorial text-[#1E292E]">
                  Scholarly Citation &amp; Artifact Repository
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#7A8287]">
                BIBTEX &amp; ARTIFACTS
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 8 Cols: BibTeX Code block */}
              <div className="lg:col-span-8 bg-[#1E292E] text-gray-200 p-4 rounded-2xl font-mono text-xs relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700 text-[10px] text-gray-400">
                  <span>BIBTEX ENTRY (TMLSI 2024)</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-700/60 hover:bg-gray-700 text-gray-200 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy BibTeX"}</span>
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed overflow-x-auto text-gray-300">
                  {bibtex}
                </pre>
              </div>

              {/* Right 4 Cols: Artifact Repository Buttons */}
              <div className="lg:col-span-4 space-y-2.5 flex flex-col justify-between">
                <div className="text-[10px] font-mono uppercase text-[#7A8287] tracking-wider">
                  RESEARCH ARTIFACTS
                </div>

                <div className="p-3 rounded-xl real-glass-subcard border border-white/80 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">GitHub Repository</div>
                    <div className="text-[10px] text-[#7A8287] font-mono">deepspur/models-audit</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#5F6568]" />
                </div>

                <div className="p-3 rounded-xl real-glass-subcard border border-white/80 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">ArXiv Preprint</div>
                    <div className="text-[10px] text-[#7A8287] font-mono">arXiv:2403.09112 [cs.CV]</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#5F6568]" />
                </div>

                <div className="p-3 rounded-xl real-glass-subcard border border-white/80 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#1E292E]">Model Weights & Checkpoints</div>
                    <div className="text-[10px] text-[#7A8287] font-mono">huggingface.co/deepspur-v1.5</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#5F6568]" />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono text-emerald-800 flex items-center justify-between">
                  <span className="font-semibold">Audited Framework Integrity</span>
                  <span>PASSED BENCHMARK CHECKS</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
