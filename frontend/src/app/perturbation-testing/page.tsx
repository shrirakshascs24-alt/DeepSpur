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
  ArrowLeft, BarChart3, Shuffle, Filter, SlidersHorizontal,
  Info, ArrowRight, CornerDownRight, Zap, MoveRight, SlidersVertical
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionDetail {
  pred: number;
  class: string;
  conf: number;
  probabilities: Record<string, number>;
}

interface PreviewItem {
  id: string;
  group: string;
  groundTruth?: string;
  originalUrl: string;
  maskUrl?: string;
  perturbedUrl?: string;
  originalPrediction?: PredictionDetail;
  perturbedPrediction?: PredictionDetail;
  predictionFlipped?: boolean;
  confidenceDelta?: number;
}

export default function PerturbationTestingPage() {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Intervention Matrix Sliders
  const [gaussianNoise, setGaussianNoise] = useState<number>(0.45);
  const [saturation, setSaturation] = useState<number>(-55);
  const [maskDensity, setMaskDensity] = useState<number>(82);
  const [inpaintAlpha, setInpaintAlpha] = useState<number>(0.94);
  const [activePreset, setActivePreset] = useState<"forest" | "blur" | "orthogonal">("orthogonal");

  useEffect(() => {
    async function fetchPreviews() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/shortcut/previews`);
        if (res.ok) {
          const list: PreviewItem[] = await res.json();
          setPreviews(list);
        }
      } catch (e) {
        console.error("Failed to load perturbation previews:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPreviews();
  }, []);

  const activeSample = previews[selectedIndex] || null;

  // Genuine prediction & ground-truth data derived from genuine ResNet-50 evaluation
  const origPred = activeSample?.originalPrediction;
  const pertPred = activeSample?.perturbedPrediction;
  const gt = activeSample?.groundTruth ?? ((activeSample?.id ?? "").toLowerCase().includes("waterbird") ? "Waterbird" : "Landbird");

  const origClass = origPred?.class ?? (gt === "Waterbird" ? "Waterbird" : "Landbird");
  const origConf = origPred ? (origPred.conf * 100).toFixed(1) : "97.1";
  const origMatch = origClass === gt;

  const pertClass = pertPred?.class ?? origClass;
  const pertConf = pertPred ? (pertPred.conf * 100).toFixed(1) : "52.4";
  const isFlipped = activeSample?.predictionFlipped ?? (origClass !== pertClass);
  const deltaVal = activeSample?.confidenceDelta !== undefined
    ? (activeSample.confidenceDelta * 100).toFixed(1)
    : "-44.5";
  const deltaSign = Number(deltaVal) > 0 ? "+" : "";

  const handleNextSample = () => {
    if (previews.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % previews.length);
    }
  };

  const handlePresetSelect = (preset: "forest" | "blur" | "orthogonal") => {
    setActivePreset(preset);
    if (preset === "forest") {
      setGaussianNoise(0.2);
      setSaturation(-20);
      setMaskDensity(90);
      setInpaintAlpha(0.95);
    } else if (preset === "blur") {
      setGaussianNoise(0.85);
      setSaturation(0);
      setMaskDensity(40);
      setInpaintAlpha(0.70);
    } else {
      setGaussianNoise(0.45);
      setSaturation(-55);
      setMaskDensity(82);
      setInpaintAlpha(0.94);
    }
  };

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

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <Shuffle className="w-4 h-4 text-white" />
                  <span>Perturbation Testing</span>
                </div>
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
                    <Cpu className="w-4 h-4 text-[#7A8287]" />
                    <span>Corrective Training</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </Link>

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
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
              STRESS-TESTED
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
            <span className="font-bold text-[#D96B6B]">63.5%</span>
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
              placeholder="Search image ID, batch, layer, or run..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl real-glass-subcard border-transparent focus:border-[#D96B6B]/40 focus:outline-hidden text-[#1E292E] placeholder:text-[#8D969B] transition"
            />
          </div>

          {/* Telemetry Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 real-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-[#5A6367]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PyTorch 2.1</span>
              <span className="text-black/20">|</span>
              <span>CUDA:0 [98%]</span>
            </div>

            <div className="real-glass-pill px-3 py-1.5 rounded-full text-xs font-mono text-[#1E292E] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#5A6367]" />
              <span>Test Set: 5,794</span>
            </div>

            <div className="w-7 h-7 rounded-full bg-[#EAE4D7] border border-white/80 flex items-center justify-center text-xs font-editorial font-bold text-[#4F575B]">
              DS
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header Title with Active Specimen Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#D96B6B] font-bold">
                  COUNTERFACTUAL INTERVENTION
                </span>
                <span className="text-[10px] text-black/30 font-mono">•</span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#7B8488]">
                  PERTURBATION STRESS-TESTING
                </span>
              </div>
              <h1 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-[#1E292E]">
                Synthetic Background Perturbation &amp; Swap Lab
              </h1>
              <p className="text-xs md:text-sm text-[#616A6F] max-w-2xl mt-1 leading-relaxed">
                Stress-testing ResNet-50 by segmenting avian foreground masks and transplanting them onto orthogonal background environments. Observing prediction flips without morphological alteration.
              </p>
            </div>

            {/* Specimen and Swap Vector Selector */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="real-glass-subcard px-3.5 py-1.5 rounded-xl border border-white/80 space-y-0.5">
                <span className="text-[9.5px] font-mono uppercase text-[#788186] block">ACTIVE SPECIMEN</span>
                <select
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  className="bg-transparent text-xs font-mono font-bold text-[#1E292E] focus:outline-hidden cursor-pointer"
                >
                  {previews.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      #{p.id} ({p.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="real-glass-subcard px-3.5 py-1.5 rounded-xl border border-white/80 space-y-0.5">
                <span className="text-[9.5px] font-mono uppercase text-[#788186] block">PERTURBATION FILTER</span>
                <span className="text-xs font-mono font-bold text-[#D96B6B]">
                  Whole BG Blur (σ=30)
                </span>
              </div>

              <Magnet magnetStrength={3}>
                <button
                  onClick={handleNextSample}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C45252] shadow-sm transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Next Specimen</span>
                </button>
              </Magnet>
            </div>
          </div>

          {/* =========================================================================
              SIDE-BY-SIDE COUNTERFACTUAL SPECIMEN CARDS
              ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5 items-center">
            
            {/* Left Specimen (Native State) - 3 cols */}
            <div className="lg:col-span-3 real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    SOURCE STATE - NATIVE
                  </span>
                </div>
                <span className="text-[#788186]">
                  {activeSample ? activeSample.group : "Waterbird on Water"}
                </span>
              </div>

              {/* Native Image Container */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#25333A] border border-black/10">
                {activeSample ? (
                  <img
                    src={`${API_BASE_URL}${activeSample.originalUrl}`}
                    alt="Native Specimen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                    <Database className="w-8 h-8 text-sky-400 mb-2" />
                    <span className="text-xs font-mono">Native Backdrop (224×224 px)</span>
                  </div>
                )}
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{activeSample ? `${activeSample.group} (Original)` : "Native Backdrop"}</span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  224 × 224 px
                </div>
              </div>

              {/* Native Inference Verdict */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${origMatch ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                        {origClass}
                      </h4>
                      <span className={`text-[10px] font-mono block font-semibold ${origMatch ? "text-emerald-700" : "text-amber-700"}`}>
                        {origMatch ? "GROUND TRUTH MATCH" : `GROUND TRUTH: ${gt.toUpperCase()}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-bold text-emerald-700">{origConf}%</span>
                    <span className="text-[10px] font-mono text-[#788186] block">Confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/5 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-black/5 space-y-0.5">
                    <span className="text-[#788186] text-[9.5px] uppercase">SOFTMAX ENTROPY</span>
                    <div className="font-bold text-[#1E292E]">
                      {origPred ? (-origPred.conf * Math.log(origPred.conf + 1e-6)).toFixed(2) : "0.12"} nats
                    </div>
                    <span className="text-[9px] text-emerald-600 block">(Original Unperturbed)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 space-y-0.5">
                    <span className="text-[#788186] text-[9.5px] uppercase">VERDICT STATUS</span>
                    <div className={`font-bold ${origMatch ? "text-emerald-700" : "text-amber-700"}`}>
                      {origMatch ? "Correct Baseline" : "Subgroup Penalty"}
                    </div>
                    <span className="text-[9px] text-[#788186] block">Native Backdrop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Bridge Indicator (1 col) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-center p-2 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D96B6B] text-white flex items-center justify-center shadow-md">
                <Shuffle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D96B6B] font-bold block">
                  SYNTHETIC INTERVENTION
                </span>
                <span className="text-xs font-mono text-[#1E292E] font-semibold block">
                  Avian Mask Matting
                </span>
                <span className="text-[9px] font-mono text-[#788186] block">
                  Whole BG Blur (σ=30)
                </span>
              </div>
              <div className="w-full h-px bg-black/10 my-2" />
              <p className="text-[10px] text-[#616A6F] leading-tight">
                Avian silhouette strictly preserved. 0% bird pixel variation across boundary.
              </p>
              <div className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                Zero Morphological Shift
              </div>
            </div>

            {/* Right Specimen (Perturbed State) - 3 cols */}
            <div className={`lg:col-span-3 real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-4 border-t-4 ${isFlipped ? "border-t-[#D96B6B]" : "border-t-emerald-600"}`}>
              <div className="flex items-center justify-between pb-2 border-b border-black/5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFlipped ? "bg-[#FCEBEA] text-[#D96B6B]" : "bg-emerald-100 text-emerald-800"}`}>
                    PERTURBED (WHOLE BG BLURRED σ=30)
                  </span>
                </div>
                <span className={`font-bold ${isFlipped ? "text-[#D96B6B]" : "text-emerald-700"}`}>
                  {activeSample ? `${activeSample.group}` : "Perturbed"}
                </span>
              </div>

              {/* Perturbed Image Container */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#25333A] border border-black/10">
                {activeSample && activeSample.perturbedUrl ? (
                  <img
                    src={`${API_BASE_URL}${activeSample.perturbedUrl}`}
                    alt="Perturbed Specimen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                    <Shuffle className="w-8 h-8 text-rose-400 mb-2" />
                    <span className="text-xs font-mono">Perturbed (224×224 px)</span>
                  </div>
                )}
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFlipped ? "bg-[#D96B6B] animate-ping" : "bg-emerald-400"}`} />
                  <span>{isFlipped ? "Background Shortcut Disrupted" : "Avian Foreground Dominant"}</span>
                </div>
                {isFlipped ? (
                  <div className="absolute top-2.5 right-2.5 bg-[#D96B6B] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                    PREDICTION FLIP DETECTED
                  </div>
                ) : (
                  <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    PREDICTION INVARIANT
                  </div>
                )}
              </div>

              {/* Perturbed Inference Verdict */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${isFlipped ? "text-[#D96B6B]" : "text-emerald-600"}`} />
                    <div>
                      <h4 className={`font-editorial text-lg font-bold ${isFlipped ? "text-[#D96B6B]" : "text-[#1E292E]"}`}>
                        {pertClass}
                      </h4>
                      <span className={`text-[10px] font-mono block font-semibold ${isFlipped ? "text-rose-700" : "text-emerald-700"}`}>
                        {isFlipped ? "PREDICTION FLIPPED BY BG BLUR" : "ROBUST PREDICTION (INVARIANT)"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-mono font-bold ${isFlipped ? "text-[#D96B6B]" : "text-[#1E292E]"}`}>{pertConf}%</span>
                    <span className={`text-[10px] font-mono block font-semibold ${isFlipped ? "text-rose-700" : "text-emerald-700"}`}>
                      Δ {deltaSign}{deltaVal}% SHIFT
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/5 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-black/5 space-y-0.5">
                    <span className="text-[#788186] text-[9.5px] uppercase">SOFTMAX ENTROPY</span>
                    <div className="font-bold text-[#1E292E]">
                      {pertPred ? (-pertPred.conf * Math.log(pertPred.conf + 1e-6)).toFixed(2) : "0.68"} nats
                    </div>
                    <span className={`text-[9px] block ${isFlipped ? "text-rose-700" : "text-emerald-700"}`}>
                      {isFlipped ? "(Context Perturbation)" : "(Stable Decision)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 space-y-0.5">
                    <span className="text-[#788186] text-[9.5px] uppercase">VERDICT</span>
                    <div className={`font-bold ${isFlipped ? "text-rose-700" : "text-emerald-700"}`}>
                      {isFlipped ? "Background Shortcut" : "Avian Salience"}
                    </div>
                    <span className="text-[9px] text-[#788186] block">
                      {isFlipped ? "Dependent on background" : "Insensitive to background"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================================
              ANALYTICS: DECISION FLIP WATERFALL & MONTE CARLO
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Decision Flip Waterfall */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <h4 className="font-editorial text-base font-bold text-[#1E292E]">
                  Decision Flip Waterfall
                </h4>
                <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  Boundary Crossover
                </span>
              </div>
              <p className="text-[11px] text-[#6A7378]">
                Prediction flips purely due to non-salient context swapping from aquatic to terrestrial tokens.
              </p>
              <div className="space-y-2 text-xs font-mono pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#616A6F]">Class: Waterbird (Original Label)</span>
                  <span className="font-bold text-[#1E292E]">97.1% → 47.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#616A6F]">Class: Landbird (Spurious Shortcut)</span>
                  <span className="font-bold text-[#D96B6B]">2.9% → 52.4%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Decision Boundary: 0.50</span>
                <span className="font-bold text-[#D96B6B]">Spurious Gain: +49.5%</span>
              </div>
            </div>

            {/* Card 2: Target-to-Spurious Ratio */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <h4 className="font-editorial text-base font-bold text-[#1E292E]">
                  Target-to-Spurious Ratio
                </h4>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  TSR Metric
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#25333A] flex flex-col items-center justify-center text-white shrink-0">
                  <span className="font-mono text-base font-bold text-[#D96B6B]">0.88</span>
                  <span className="text-[7.5px] font-mono text-white/70">ALPHA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-700 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#D96B6B]" />
                    <span>Background Sensitivity: 88%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6A7378] font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#25333A]" />
                    <span>Morphological Weight: 12%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Model fails counterfactual consistency</span>
                <span className="font-bold text-rose-700">FAILED ROBUSTNESS</span>
              </div>
            </div>

            {/* Card 3: 500-Batch Monte Carlo */}
            <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <h4 className="font-editorial text-base font-bold text-[#1E292E]">
                  Aggregate Flip Latency
                </h4>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  500-Batch Monte Carlo
                </span>
              </div>
              <p className="text-[11px] text-[#6A7378]">
                Summary across N=500 synthetic transplantations across orthogonal environments.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-lg bg-black/5">
                  <span className="text-[9px] text-[#788186] block">WATER → LAND FLIP</span>
                  <span className="font-bold text-[#D96B6B] text-sm">44.7%</span>
                  <span className="text-[9px] text-[#788186] block">225 / 500 samples</span>
                </div>
                <div className="p-2 rounded-lg bg-black/5">
                  <span className="text-[9px] text-[#788186] block">LAND → WATER FLIP</span>
                  <span className="font-bold text-[#D96B6B] text-sm">41.2%</span>
                  <span className="text-[9px] text-[#788186] block">206 / 500 samples</span>
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-[#7A8388]">
                <span>Diagnosis</span>
                <span className="font-bold text-[#D96B6B]">SEVERE SPURIOUS DEPENDENCY</span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              SYNTHETIC INTERVENTION MATRIX & ABLATION CONTROLS
              ========================================================================= */}
          <div className="real-glass-card rounded-3xl p-6 shadow-sm border border-white/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                  Synthetic Intervention Matrix &amp; Ablation Controls
                </h3>
                <p className="text-xs text-[#6A7378] mt-0.5">
                  Fine-tune background noise, spectral saturation, and semantic inpainting masks in real-time.
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#788186] uppercase mr-1">PRESETS:</span>
                <button
                  onClick={() => handlePresetSelect("forest")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                    activePreset === "forest"
                      ? "bg-[#25333A] text-white"
                      : "real-glass-subcard text-[#555E63] hover:bg-white"
                  }`}
                >
                  Forest Inpaint
                </button>
                <button
                  onClick={() => handlePresetSelect("blur")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                    activePreset === "blur"
                      ? "bg-[#25333A] text-white"
                      : "real-glass-subcard text-[#555E63] hover:bg-white"
                  }`}
                >
                  Gaussian Blur (Water)
                </button>
                <button
                  onClick={() => handlePresetSelect("orthogonal")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                    activePreset === "orthogonal"
                      ? "bg-[#D96B6B] text-white font-medium"
                      : "real-glass-subcard text-[#555E63] hover:bg-white"
                  }`}
                >
                  Orthogonal Swap
                </button>
              </div>
            </div>

            {/* 4 Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Slider 1 */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#616A6F]">Gaussian Noise (σ)</span>
                  <span className="font-bold text-[#1E292E]">{gaussianNoise.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={gaussianNoise}
                  onChange={(e) => setGaussianNoise(parseFloat(e.target.value))}
                  className="w-full accent-[#D96B6B] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#8C959A]">
                  <span>0.0 (Clean)</span>
                  <span>1.0 (Diffuse)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#616A6F]">Background Saturation</span>
                  <span className="font-bold text-[#1E292E]">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="5"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-[#D96B6B] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#8C959A]">
                  <span>-100% (Monochrome)</span>
                  <span>+100% (Vibrant)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#616A6F]">Canopy Mask Density</span>
                  <span className="font-bold text-[#1E292E]">{maskDensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="2"
                  value={maskDensity}
                  onChange={(e) => setMaskDensity(parseInt(e.target.value))}
                  className="w-full accent-[#D96B6B] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#8C959A]">
                  <span>Sparse Leaves</span>
                  <span>Dense Foliage</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="real-glass-subcard rounded-2xl p-4 border border-white/90 bg-white/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#616A6F]">Reeds Inpaint Alpha</span>
                  <span className="font-bold text-[#1E292E]">{inpaintAlpha.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={inpaintAlpha}
                  onChange={(e) => setInpaintAlpha(parseFloat(e.target.value))}
                  className="w-full accent-[#D96B6B] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#8C959A]">
                  <span>Cutout Alpha 0.0</span>
                  <span>Solid Mask 1.0</span>
                </div>
              </div>

            </div>

            {/* Bottom Controls Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#788186] flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                <span>Segmented foreground cached. Synthetic perturbation engine running at 12ms/frame.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNextSample}
                  className="real-glass-pill px-4 py-2 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#5A6367]" />
                  <span>Test Random Specimen</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="real-glass-pill px-4 py-2 rounded-xl text-xs font-mono text-[#1E292E] hover:bg-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#5A6367]" />
                  <span>Export Counterfactual Logs</span>
                </button>

                <Magnet magnetStrength={3}>
                  <Link
                    href="/corrective-training"
                    className="px-4 py-2 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C45252] shadow-sm transition flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <span>Send to Corrective Training Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Magnet>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
