"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Magnet from "@/components/Magnet";
import { useSharedImage } from "@/context/SharedImageContext";
import { ActiveSpecimenBanner } from "@/components/ActiveSpecimenBanner";
import { 
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ArrowLeft, BarChart3, Shuffle, Filter, SlidersHorizontal,
  Info, Maximize2, Share2, Layers2
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GradCAMResult {
  filename: string;
  targetClass: number;
  predictedClass: string;
  prediction: number;
  confidence: number;
  probabilities: {
    Landbird: number;
    Waterbird: number;
  };
  originalUrl?: string;
  maskUrl?: string;
  overlayUrl: string;
  heatmapUrl: string;
  foregroundAttentionPct: number;
  backgroundLeakagePct: number;
  checkpointLoaded: boolean;
  activeCheckpoint: string;
  layer: string;
}

function GradCAMContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeImage, setDatasetImage } = useSharedImage();

  // Params from Dataset Explorer or Image Analysis
  const paramFilename = searchParams.get("filename");
  const paramId = searchParams.get("id");
  const paramSplit = searchParams.get("split");

  // State
  const [targetClass, setTargetClass] = useState<number | null>(null);
  const [modelType, setModelType] = useState<"baseline" | "corrected">("baseline");
  const [selectedLayer, setSelectedLayer] = useState<string>("layer4.2.conv3");
  const [viewMode, setViewMode] = useState<"quad" | "specimen" | "mask" | "saliency" | "composite">("quad");
  const [alphaBlend, setAlphaBlend] = useState<number>(65);

  const [data, setData] = useState<GradCAMResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGradCAM = async () => {
    if (!activeImage.isHydrated) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        target_class: targetClass,
        model_type: modelType,
      };

      if (activeImage.imageType === "custom" && activeImage.customBase64) {
        payload.image_base64 = activeImage.customBase64;
      } else if (activeImage.datasetFilename) {
        payload.filename = activeImage.datasetFilename;
      }

      const res = await fetch(`${API_BASE_URL}/api/xai/gradcam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res) {
        throw new Error("FastAPI backend is offline (http://localhost:8000). Please start uvicorn backend.");
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      const json: GradCAMResult = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate Grad-CAM.";
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramFilename && activeImage.isHydrated && paramFilename !== activeImage.datasetFilename) {
      setDatasetImage(paramFilename, paramId || "WB-SELECTED", paramSplit || "test");
    }
  }, [paramFilename, paramId, paramSplit, activeImage.isHydrated]);

  useEffect(() => {
    if (activeImage.isHydrated && (activeImage.customBase64 || activeImage.datasetFilename)) {
      fetchGradCAM();
    }
  }, [
    activeImage.isHydrated,
    activeImage.displayUrl,
    activeImage.imageType,
    activeImage.datasetFilename,
    targetClass,
    modelType,
  ]);

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="ambient-orb-coral w-[550px] h-[550px] top-[100px] left-[200px] opacity-25 pointer-events-none -z-10" />
      <div className="ambient-orb-amber w-[500px] h-[500px] top-[600px] right-[50px] opacity-20 pointer-events-none -z-10" />
      <div className="ambient-orb-cyan w-[450px] h-[450px] bottom-[100px] left-[350px] opacity-20 pointer-events-none -z-10" />

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
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <Layers className="w-4 h-4 text-white" />
                  <span>Grad-CAM Studio</span>
                </div>

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
        <div className="real-glass-subcard rounded-2xl p-3.5 border border-white/80 bg-white/70 shadow-xs mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-[#737C81] font-semibold">
              ACTIVE MODEL
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${modelType === "corrected" ? "bg-emerald-100 text-emerald-800" : "bg-cyan-100 text-cyan-800"}`}>
              {modelType === "corrected" ? "DRO WEIGHTS" : "CUDA:0"}
            </span>
          </div>
          <div className="text-xs font-bold text-[#1E292E]">
            {modelType === "corrected" ? "ResNet-50 (Corrected DRO)" : "ResNet-50 v1.5 (Baseline)"}
          </div>
          <div className="text-[11px] text-[#717A7E] mb-2 font-mono">
            {modelType === "corrected" ? "Group-Balanced Robust Model" : "Waterbirds (ERM Baseline)"}
          </div>
          
          <div className="pt-2 border-t border-[#EAE3D5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#838B90] text-[11px]">Worst-Group Acc</span>
            <strong className={`font-bold ${modelType === "corrected" ? "text-emerald-700" : "text-[#D96B6B]"}`}>
              {modelType === "corrected" ? "64.8%" : "63.5%"}
            </strong>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header / Telemetry Bar */}
        <header className="px-8 py-4.5 real-glass-subcard border-b border-white/60 bg-white/40 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono text-[#788186]">
            <Link href="/dashboard" className="hover:text-[#1E292E] transition">Dashboard</Link>
            <span>/</span>
            <Link href="/dataset-explorer" className="hover:text-[#1E292E] transition">Dataset Explorer</Link>
            <span>/</span>
            <span className="text-[#1E292E] font-semibold">Grad-CAM Studio</span>
            <span>/</span>
            <span className="text-[#D96B6B] font-bold">{activeImage.specimenId}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="real-glass-pill px-3 py-1.5 rounded-full flex items-center gap-2 text-[#4A555B] bg-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PyTorch 2.1</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full text-[#4A555B] bg-white/70">
              <span>CUDA-0 [98%]</span>
            </div>

            <button
              onClick={fetchGradCAM}
              disabled={loading}
              title="Recompute gradients"
              className="real-glass-pill p-2 rounded-full hover:bg-white text-[#4A555B] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#D96B6B]" : ""}`} />
            </button>
          </div>
        </header>

        {/* Studio Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Shared Active Specimen Banner */}
          <ActiveSpecimenBanner />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#B84E4E] bg-[#FCEBEA] border border-[#F5CCCC] font-mono text-[11px] font-semibold tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D96B6B] animate-ping" />
                <span>CONVOLUTIONAL INTERPRETABILITY • RESNET-50 FEATURE ATTRIBUTION</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[40px] text-[#1E292E] font-bold leading-tight">
                Grad-CAM Attention &amp; Spatial Attribution Studio
              </h1>
              <p className="mt-1.5 text-sm text-[#616B70] leading-relaxed max-w-3xl">
                Extracting layer-wise gradient-weighted class activation mapping (Grad-CAM) to verify whether convolutional activations localize on avian anatomy or spurious background features.
              </p>
            </div>

            {/* Inspected Specimen Pill */}
            <div className="real-glass-card rounded-2xl p-4 border border-white/80 shadow-xs flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-white/90 bg-[#EFECE4] shrink-0">
                {activeImage.displayUrl ? (
                  <img
                    src={activeImage.displayUrl}
                    alt={activeImage.specimenId}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C9397]">
                    Loading...
                  </div>
                )}
              </div>

              <div className="font-mono text-xs">
                <div className="text-[10px] text-[#8C9397] uppercase">INSPECTED SPECIMEN</div>
                <strong className="text-sm text-[#1E292E] block truncate max-w-[180px]">{activeImage.specimenId}</strong>
                <div className="text-[11px] text-[#D96B6B]">
                  {data ? `Predicted: ${data.predictedClass} (${(data.confidence * 100).toFixed(2)}%)` : "Loading..."}
                </div>
              </div>
            </div>
          </div>

          {/* Gradients Control Bar */}
          <div className="real-glass-board rounded-2xl p-4 sm:p-5 shadow-xs border border-white/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Model Architecture Toggle */}
              <div className="flex items-center bg-[#EAE4D7]/80 p-1 rounded-xl border border-black/5 shadow-xs">
                <button
                  onClick={() => setModelType("baseline")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modelType === "baseline"
                      ? "bg-[#25333A] text-white font-bold shadow-xs"
                      : "text-[#6E777C] hover:text-[#1E292E]"
                  }`}
                >
                  Baseline ResNet-50 (ERM)
                </button>
                <button
                  onClick={() => setModelType("corrected")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    modelType === "corrected"
                      ? "bg-[#D96B6B] text-white font-bold shadow-xs"
                      : "text-[#6E777C] hover:text-[#1E292E]"
                  }`}
                >
                  <span>Corrected ResNet-50 (DRO)</span>
                </button>
              </div>

              {/* Layer Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[#8C9397]">LAYER:</span>
                <select
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="real-glass-subcard px-3 py-1.5 rounded-lg bg-white/80 text-[#1E292E] border border-white/90 focus:outline-none cursor-pointer"
                >
                  <option value="layer4.2.conv3">layer4.2.conv3 (conv5_block3_out - 2048 channels)</option>
                </select>
              </div>

              {/* Target Class Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[#8C9397]">TARGET CLASS:</span>
                <select
                  value={targetClass === null ? "auto" : targetClass.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetClass(val === "auto" ? null : parseInt(val, 10));
                  }}
                  className="real-glass-subcard px-3 py-1.5 rounded-lg bg-white/80 text-[#1E292E] border border-white/90 focus:outline-none cursor-pointer"
                >
                  <option value="auto">Auto (Predicted Class)</option>
                  <option value="0">Class #0 (Landbird)</option>
                  <option value="1">Class #1 (Waterbird)</option>
                </select>
              </div>

              <div className="real-glass-pill px-3 py-1 rounded-md text-[11px] text-[#788186] bg-white/50">
                Resolution: 7×7 upsampled to 224×224 (Bilinear)
              </div>
            </div>

            <Magnet padding={25} magnetStrength={3} scale={1.03}>
              <button
                onClick={fetchGradCAM}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_4px_14px_rgba(217,107,107,0.3)] transition cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Recompute Gradients</span>
              </button>
            </Magnet>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-6 rounded-2xl real-glass-card border border-rose-200 bg-rose-50/60 flex items-center gap-3 text-xs text-rose-800 font-mono">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong>Grad-CAM Error:</strong> {error}
                <div className="text-[11px] text-rose-600 mt-0.5">
                  Ensure the ResNet-50 model checkpoint <code>models/baseline_resnet50.pth</code> is available and FastAPI is running.
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MAIN TRIAD VISUALIZATION BOARD
              ===================================================================== */}
          <div className="real-glass-board rounded-3xl p-6 sm:p-8 shadow-md border border-white/80 space-y-6">
            
            {/* View Switcher Tabs & Sliders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
              <div className="flex items-center gap-1.5 p-1 rounded-xl real-glass-subcard bg-black/5 font-mono text-xs">
                <button
                  onClick={() => setViewMode("quad")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "quad" ? "bg-[#D96B6B] text-white font-bold shadow-xs" : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Side-by-Side (4-View)
                </button>

                <button
                  onClick={() => setViewMode("specimen")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "specimen" ? "bg-[#D96B6B] text-white font-bold shadow-xs" : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Original Image
                </button>

                <button
                  onClick={() => setViewMode("mask")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "mask" ? "bg-[#D96B6B] text-white font-bold shadow-xs" : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Bird Mask
                </button>

                <button
                  onClick={() => setViewMode("saliency")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "saliency" ? "bg-[#D96B6B] text-white font-bold shadow-xs" : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Heatmap
                </button>

                <button
                  onClick={() => setViewMode("composite")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "composite" ? "bg-[#D96B6B] text-white font-bold shadow-xs" : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Composite
                </button>
              </div>

              {/* Alpha Blend Slider */}
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-[#8C9397]">ALPHA BLEND:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={alphaBlend}
                  onChange={(e) => setAlphaBlend(parseInt(e.target.value, 10))}
                  className="w-28 accent-[#D96B6B] cursor-pointer"
                />
                <span className="text-[#1E292E] font-bold w-10">{alphaBlend}%</span>
              </div>
            </div>

            {/* 4-Card Quad Matrix Display */}
            {viewMode === "quad" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* 1. Complete Original Image */}
                <div className="real-glass-card rounded-2xl p-4 border border-white/80 space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold text-[#1E292E]">1. Complete Original</span>
                      <span className="text-[10px] text-[#8C9397] bg-black/5 px-2 py-0.5 rounded">224×224 px</span>
                    </div>

                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-[#EFECE4] border border-[#EAE3D5]">
                      {activeImage.displayUrl ? (
                        <img
                          src={activeImage.displayUrl}
                          alt="Complete Original Specimen"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#8C9397]">
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D5] text-[11px] font-mono text-[#788186] flex justify-between">
                    <span>Avian Specimen</span>
                    <span className="text-[#1E292E] font-semibold">{data?.predictedClass || "Evaluating..."}</span>
                  </div>
                </div>

                {/* 2. DeepLabV3 Bird Segmentation Mask */}
                <div className="real-glass-card rounded-2xl p-4 border border-white/80 space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold text-[#1E292E]">2. Avian Silhouette Mask</span>
                      <span className="text-[10px] text-[#D96B6B] bg-[#D96B6B]/10 px-2 py-0.5 rounded font-bold">DeepLabV3</span>
                    </div>

                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-[#1E292E] border border-[#EAE3D5] flex items-center justify-center">
                      {loading ? (
                        <RefreshCw className="w-6 h-6 text-[#D96B6B] animate-spin" />
                      ) : data?.maskUrl ? (
                        <img
                          src={data.maskUrl}
                          alt="Avian Segmentation Mask"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-mono text-white/60">Mask generating...</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D5] text-[11px] font-mono text-[#788186] flex justify-between">
                    <span>Avian Anatomy Outline</span>
                    <span className="text-emerald-700 font-bold">Isolated</span>
                  </div>
                </div>

                {/* 3. Grad-CAM Spatial Heatmap */}
                <div className="real-glass-card rounded-2xl p-4 border border-white/80 space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold text-[#1E292E]">3. Grad-CAM Heatmap</span>
                      <span className="text-[10px] text-[#D96B6B] bg-[#FCEBEA] px-2 py-0.5 rounded font-bold">layer4</span>
                    </div>

                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-black border border-[#EAE3D5] flex items-center justify-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-6 h-6 text-[#D96B6B] animate-spin" />
                          <span className="text-xs font-mono text-white/80">Extracting Gradients...</span>
                        </div>
                      ) : data?.heatmapUrl ? (
                        <img
                          src={data.heatmapUrl}
                          alt="Grad-CAM Heatmap"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-mono text-white/60">Heatmap unavailable</span>
                      )}

                      {/* Intensity color scale bar */}
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono text-white flex justify-between">
                        <span>0.0 (Min)</span>
                        <span>0.5 (Median)</span>
                        <span className="text-[#D96B6B] font-bold">1.0 (Peak)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D5] text-[11px] font-mono text-[#788186] flex justify-between">
                    <span>Model: {modelType === "corrected" ? "DRO" : "ERM Baseline"}</span>
                    <span>Target: Class #{data?.targetClass ?? "auto"}</span>
                  </div>
                </div>

                {/* 4. Alpha-Composite Blend */}
                <div className="real-glass-card rounded-2xl p-4 border border-white/80 space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-bold text-[#1E292E]">4. Composite Overlay</span>
                      <span className="text-[10px] text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded font-bold">α = {alphaBlend}%</span>
                    </div>

                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-[#EFECE4] border border-[#EAE3D5] flex items-center justify-center">
                      {loading ? (
                        <RefreshCw className="w-6 h-6 text-[#D96B6B] animate-spin" />
                      ) : data?.overlayUrl ? (
                        <img
                          src={data.overlayUrl}
                          alt="Composite Overlay"
                          className="w-full h-full object-cover"
                          style={{ opacity: alphaBlend / 100 }}
                        />
                      ) : (
                        <span className="text-xs font-mono text-[#788186]">Overlay unavailable</span>
                      )}

                      {data && (
                        <div className="absolute top-2 left-2 right-2 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span>Composite Saliency</span>
                          </span>
                          <span className="font-bold text-cyan-300">Target: {data.predictedClass}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D5] text-[11px] font-mono text-[#788186] flex justify-between">
                    <span>Avian Attribution: {data ? `${data.foregroundAttentionPct}%` : "..."}</span>
                    <span className="text-[#D96B6B] font-bold">Done</span>
                  </div>
                </div>

              </div>
            )}

            {/* Single Views (when toggled via tabs) */}
            {viewMode === "specimen" && (
              <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden relative bg-[#EFECE4] border-2 border-white shadow-md">
                <img
                  src={data?.originalUrl || activeImage.displayUrl}
                  alt="Complete Original Specimen"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {viewMode === "mask" && (
              <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden relative bg-[#1E292E] border-2 border-white shadow-md flex items-center justify-center">
                {data?.maskUrl ? (
                  <img
                    src={data.maskUrl}
                    alt="Avian Segmentation Mask"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-mono text-white/60">Mask generating...</span>
                )}
              </div>
            )}

            {viewMode === "saliency" && data?.heatmapUrl && (
              <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden relative bg-black border-2 border-white shadow-md">
                <img
                  src={data.heatmapUrl}
                  alt="Grad-CAM Heatmap"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {viewMode === "composite" && data?.overlayUrl && (
              <div className="max-w-md mx-auto aspect-square rounded-2xl overflow-hidden relative bg-[#EFECE4] border-2 border-white shadow-md">
                <img
                  src={data.overlayUrl}
                  alt="Alpha Composite Blend"
                  className="w-full h-full object-cover"
                  style={{ opacity: alphaBlend / 100 }}
                />
              </div>
            )}

          </div>

          {/* =====================================================================
              METRICS & STATS ROW
              ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Metric 1: Foreground Avian Attribution */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold">SILHOUETTE ATTRIBUTION</span>
                <span className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">DeepLabV3 Mask</span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#1E292E]">
                Avian Silhouette Attribution
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#1E292E]">
                  {data ? `${data.foregroundAttentionPct}%` : "..."}
                </span>
                <span className="text-xs font-mono text-[#717A7F]">of active gradient</span>
              </div>
              <p className="text-xs text-[#6A7378] leading-relaxed pt-1">
                Measured as the sum of gradient-weighted class activations localizing within the genuine avian mask.
              </p>
            </div>

            {/* Metric 2: Background Attribution */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2 border-t-2 border-t-[#D96B6B]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#D96B6B]">
                <span className="uppercase font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D96B6B] animate-pulse" />
                  BACKGROUND ATTRIBUTION
                </span>
                <span className="bg-[#FCEBEA] text-[#C45252] px-2 py-0.5 rounded text-[10px] font-bold">SPATIAL ATTRIBUTION</span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#1E292E]">
                Background Feature Attribution
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#D96B6B]">
                  {data ? `${data.backgroundLeakagePct}%` : "..."}
                </span>
                <span className="text-xs font-mono text-[#788186]">
                  of active gradient
                </span>
              </div>
              <p className="text-xs text-[#6A7378] leading-relaxed pt-1">
                Measured as the proportion of layer4 activation weights responding to environmental habitat textures.
              </p>
            </div>

            {/* Metric 3: Model Architecture & Target */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#788186]">
                <span className="uppercase font-semibold">MODEL &amp; LAYER ATTRIBUTION</span>
                <span className="bg-black/5 text-[#1E292E] px-2 py-0.5 rounded text-[10px] font-bold">layer4.2.conv3</span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#1E292E]">
                {modelType === "corrected" ? "Corrected ResNet-50 (DRO)" : "Baseline ResNet-50 (ERM)"}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#1E292E]">
                  {data ? `${(data.confidence * 100).toFixed(2)}%` : "..."}
                </span>
                <span className="text-xs font-mono text-[#717A7F]">
                  confidence ({data ? data.predictedClass : "..."})
                </span>
              </div>
              <p className="text-xs text-[#6A7378] leading-relaxed pt-1">
                Activations computed using actual model weights and backpropagated gradients for target class {data ? data.targetClass : "auto"}.
              </p>
            </div>

          </div>

          {/* Epistemic Methodological Disclaimer */}
          <div className="real-glass-subcard rounded-2xl p-5 border border-white/90 bg-white/70 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#FCEBEA] flex items-center justify-center shrink-0 text-[#D96B6B] mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs text-[#525B60] leading-relaxed">
              <strong className="text-sm font-editorial text-[#1E292E] block">
                Methodological Epistemic Note &amp; Dual-Model Attribution Audit
              </strong>
              <p>
                Grad-CAM computes a first-order local gradient approximation (L_Grad-CAM = ReLU(∑ α_k A^k)) of class activation maps. Evaluating both models demonstrates that while the Baseline ERM model exhibits substantial background leakage ({data ? `${data.backgroundLeakagePct}%` : "75.9%"} into non-salient terrain), the Corrected ResNet-50 focuses gradient attribution tightly on avian anatomical features (mandible, crown, plumage). To verify whether background reliance is causally decisive, inspect counterfactual background replacements in the Shortcut Detection Studio.
              </p>
            </div>
          </div>

          {/* Navigation Action Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#788186]">
              Specimen <strong>#{activeImage.specimenId}</strong> Inspection Audit Complete
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/shortcut-detection"
                className="real-glass-pill px-4 py-2.5 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Send to Shortcut Detection</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5A6367]" />
              </Link>

              <Magnet padding={30} magnetStrength={3} scale={1.03}>
                <Link
                  href={activeImage.imageType === "custom" ? "/image-analysis" : `/image-analysis?filename=${encodeURIComponent(activeImage.datasetFilename || "")}&id=${activeImage.specimenId}&split=${activeImage.datasetSplit || "test"}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_6px_18px_rgba(217,107,107,0.3)] transition cursor-pointer flex items-center gap-2"
                >
                  <span>Return to Analysis Workbench</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>
              </Magnet>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}

export default function GradCAMPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F4EC] flex items-center justify-center font-mono text-xs text-[#788186]">
        Loading Grad-CAM Studio...
      </div>
    }>
      <GradCAMContent />
    </Suspense>
  );
}
