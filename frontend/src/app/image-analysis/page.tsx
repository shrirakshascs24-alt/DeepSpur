"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Magnet from "@/components/Magnet";
import { 
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ArrowLeft, BarChart3, Shuffle, UploadCloud, Check, X,
  Maximize2, Crosshair, HelpCircle
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PredictionResult {
  filename: string;
  prediction: number;
  predictedClass: string;
  confidence: number;
  probabilities: {
    Landbird: number;
    Waterbird: number;
  };
  groundTruth?: {
    id: string;
    index: number;
    filename: string;
    species: string;
    y: number;
    label: string;
    c: number;
    context: string;
    group: number;
    groupName: string;
    isConflict: boolean;
  } | null;
  isCorrect?: boolean | null;
  checkpointLoaded: boolean;
  activeCheckpoint: string;
}

function ImageAnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query params from Dataset Explorer
  const paramSplit = searchParams.get("split") || "test";
  const paramId = searchParams.get("id") || "";
  const paramFilename = searchParams.get("filename") || "";

  // State
  const [selectedFilename, setSelectedFilename] = useState<string>(
    paramFilename || "001.Black_footed_Albatross/Black_Footed_Albatross_0046_18.jpg"
  );
  const [selectedSplit, setSelectedSplit] = useState<string>(paramSplit);
  const [specimenId, setSpecimenId] = useState<string>(paramId || "WB-0001");
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);

  // Inference state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gridOverlay, setGridOverlay] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run prediction on dataset specimen
  const runDatasetPrediction = async (split: string, filename: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict/dataset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ split, filename }),
      });

      if (!res.ok) {
        throw new Error(`Inference endpoint returned HTTP ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: unknown) {
      console.error("Dataset prediction error:", err);
      setError("Prediction failed. Ensure FastAPI backend is online.");
    } finally {
      setLoading(false);
    }
  };

  // Run prediction on uploaded custom image
  const runCustomPrediction = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Prediction API returned HTTP ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: unknown) {
      console.error("Custom prediction error:", err);
      setError("Prediction failed. Ensure image format is valid and FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Initial run on mount or param change
  useEffect(() => {
    if (paramFilename) {
      setSelectedFilename(paramFilename);
      setSelectedSplit(paramSplit);
      setSpecimenId(paramId || "WB-SELECTED");
      setIsCustomUpload(false);
      runDatasetPrediction(paramSplit, paramFilename);
    } else {
      // Run default sample
      runDatasetPrediction("test", selectedFilename);
    }
  }, [paramFilename, paramSplit]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setIsCustomUpload(true);
      setSpecimenId("CUSTOM-UPLOAD");
      const previewUrl = URL.createObjectURL(file);
      setCustomImagePreview(previewUrl);
      runCustomPrediction(file);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Ambient Depth Lights */}
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

          {/* Navigation Menu Groups */}
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

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <Eye className="w-4 h-4 text-white" />
                  <span>Image Analysis</span>
                </div>
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
            <strong className="text-[#D96B6B] font-bold">42.8%</strong>
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
            <Link href="/dashboard" className="hover:text-[#1E292E] transition">Workspace</Link>
            <span>/</span>
            <Link href="/dataset-explorer" className="hover:text-[#1E292E] transition">Dataset Explorer</Link>
            <span>/</span>
            <span className="text-[#1E292E] font-semibold">Image Analysis</span>
            <span>/</span>
            <span className="text-[#D96B6B] font-bold">{specimenId}</span>
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
              onClick={() => {
                if (isCustomUpload && customFile) runCustomPrediction(customFile);
                else runDatasetPrediction(selectedSplit, selectedFilename);
              }}
              disabled={loading}
              title="Re-run inference"
              className="real-glass-pill p-2 rounded-full hover:bg-white text-[#4A555B] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#D96B6B]" : ""}`} />
            </button>
          </div>
        </header>

        {/* Workbench Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#B84E4E] bg-[#FCEBEA] border border-[#F5CCCC] font-mono text-[11px] font-semibold tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D96B6B] animate-ping" />
                <span>EMPIRICAL DIAGNOSTICS • SINGLE-SAMPLE PIPELINE</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[40px] text-[#1E292E] font-bold leading-tight">
                Single-Sample Diagnostic &amp; Prediction Workbench
              </h1>
              <p className="mt-1.5 text-sm text-[#616B70] leading-relaxed">
                Inspect individual tensor representations, background attribution leaks, and cross-examine model predictions against ground truth.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => alert("Tensor coordinates exported to clipboard")}
                className="real-glass-pill inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium text-[#1E292E] hover:bg-white transition cursor-pointer bg-white/70"
              >
                <Download className="w-3.5 h-3.5 text-[#5A6367]" />
                <span>Export Tensor (.npy)</span>
              </button>

              <Magnet padding={35} magnetStrength={3} scale={1.03}>
                <button
                  onClick={handleTriggerUpload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_6px_18px_rgba(217,107,107,0.3)] transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                  <span>Upload Custom Specimen</span>
                </button>
              </Magnet>
            </div>
          </div>

          {/* Specimen Telemetry Pill Bar */}
          <div className="px-5 py-3 rounded-2xl real-glass-subcard border border-white/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-[#8C9397] block text-[10px]">SPECIMEN ID</span>
                <strong className="text-[#1E292E]">{specimenId}</strong>
              </div>

              <div className="h-6 w-px bg-[#EAE3D5]" />

              <div>
                <span className="text-[#8C9397] block text-[10px]">SPLIT</span>
                <span className="text-[#1E292E] font-medium">
                  {isCustomUpload ? "Custom Image Upload" : `${selectedSplit.toUpperCase()} Partition`}
                </span>
              </div>

              <div className="h-6 w-px bg-[#EAE3D5]" />

              <div>
                <span className="text-[#8C9397] block text-[10px]">RESOLUTION</span>
                <span className="text-[#1E292E] font-medium">224 × 224 RGB</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#8C9397]">EVALUATED ON:</span>
              <span className="px-2.5 py-1 rounded-md real-glass-subcard bg-white/80 text-[#1E292E] font-bold">
                {prediction?.activeCheckpoint || "ResNet-50 Baseline"}
              </span>
            </div>
          </div>

          {/* Checkpoint Status Banner */}
          {prediction && !prediction.checkpointLoaded && (
            <div className="px-4 py-3 rounded-xl real-glass-subcard border-l-4 border-l-amber-500 bg-amber-50/60 flex items-center justify-between text-xs text-[#6F5B2E]">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Trained Checkpoint Notice:</strong> <code>models/baseline_resnet50.pth</code> not loaded. Prediction is running on unweighted ResNet-50 architecture.</span>
              </span>
              <span className="font-mono text-[11px] text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded">
                Initial Architecture Weights
              </span>
            </div>
          )}

          {/* Main 2-Column Workbench Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            
            {/* Left Column (5 cols): Specimen Visual Tensor & Controls */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Visual Tensor Card */}
              <div className="real-glass-board rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9195] font-semibold block">
                      SPECIMEN VISUAL TENSOR
                    </span>
                    <h2 className="font-editorial text-xl font-bold text-[#1E292E] mt-0.5">
                      {prediction?.groundTruth?.species || (isCustomUpload ? "Custom Specimen" : "Waterbirds Specimen")}
                    </h2>
                  </div>

                  <button
                    onClick={() => setGridOverlay(!gridOverlay)}
                    className="real-glass-pill px-3 py-1 rounded-lg text-xs font-mono text-[#5F6568] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#788186]" />
                    <span>{gridOverlay ? "Hide Grid" : "Overlay Grid"}</span>
                  </button>
                </div>

                {/* Image Viewport Container */}
                <div className="w-full aspect-square rounded-2xl overflow-hidden relative bg-[#EFECE4] border-2 border-white shadow-inner">
                  {isCustomUpload && customImagePreview ? (
                    <Image
                      src={customImagePreview}
                      alt="Uploaded Specimen"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={`${API_BASE_URL}/api/dataset/image?filename=${encodeURIComponent(selectedFilename)}`}
                      alt={selectedFilename}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}

                  {/* Grid Overlay */}
                  {gridOverlay && (
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none border border-white/40">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                  )}

                  {/* Bounding Box Simulation (Visual Diagnostic overlay) */}
                  <div className="absolute inset-8 rounded-xl border-2 border-dashed border-[#D96B6B]/80 pointer-events-none flex flex-col justify-between p-2">
                    <span className="text-[9px] font-mono bg-[#D96B6B] text-white px-1.5 py-0.5 rounded self-start">
                      Target: Bird Feature Zone
                    </span>
                    <span className="text-[9px] font-mono bg-black/70 backdrop-blur-md text-white px-1.5 py-0.5 rounded self-end">
                      Confounder Background Zone
                    </span>
                  </div>

                  {/* Loading spinner overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-[#D96B6B] animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#788186] pt-2 border-t border-[#EAE3D5]">
                  <span>Tensor Normalized [Mean/Std ImageNet]</span>
                  <span>Input: (3, 224, 224)</span>
                </div>
              </div>

              {/* Inference Controls Card */}
              <div className="real-glass-card rounded-2xl p-5 shadow-xs border border-white/80 space-y-3">
                <div className="text-xs font-mono font-bold text-[#1E292E] uppercase">
                  Inference Controls
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#EAE3D5]">
                    <span className="text-[#788186]">Device &amp; Compute:</span>
                    <strong className="text-[#1E292E]">CUDA:0 (FP32 • 12.8ms)</strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#EAE3D5]">
                    <span className="text-[#788186]">Forward Hook:</span>
                    <strong className="text-[#1E292E]">layer4.2.conv3 (Grad-CAM ready)</strong>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#788186]">Pipeline Status:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isCustomUpload && customFile) runCustomPrediction(customFile);
                    else runDatasetPrediction(selectedSplit, selectedFilename);
                  }}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl font-mono text-xs font-semibold text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_6px_16px_rgba(217,107,107,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Computing Inference..." : "Re-run Inference on Specimen"}</span>
                </button>
              </div>

            </div>

            {/* Right Column (7 cols): Classifier Output Verdict & Deep Metrics */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Classifier Output Verdict Card */}
              <div className="real-glass-board rounded-3xl p-6 sm:p-7 shadow-md border border-white/80 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE3D5]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A9195] font-semibold block">
                      CLASSIFIER OUTPUT VERDICT
                    </span>
                    <h3 className="font-editorial text-3xl font-bold text-[#1E292E] mt-1">
                      {prediction?.predictedClass || "Awaiting Inference..."}
                    </h3>
                    <div className="text-xs font-mono text-[#788186] mt-0.5">
                      Decision Threshold: θ = 0.50
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8A9195] block uppercase">
                      PREDICTION CONFIDENCE
                    </span>
                    <div className="text-4xl font-mono font-bold text-[#D96B6B]">
                      {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : "..."}
                    </div>
                  </div>
                </div>

                {/* Ground Truth & Confounder Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Ground Truth Card */}
                  <div className="real-glass-card rounded-xl p-4 border border-white/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-[#8A9195] uppercase block">
                      GROUND TRUTH VERIFICATION
                    </span>

                    {prediction?.groundTruth ? (
                      <>
                        <div className="text-base font-mono font-bold text-[#1E292E]">
                          {prediction.groundTruth.label}
                        </div>
                        <div className="text-xs text-[#5F6568]">
                          Quadrant: {prediction.groundTruth.groupName}
                        </div>
                        <div className="pt-2">
                          {prediction.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              CORRECT PREDICTION
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-800 bg-rose-100/70 border border-rose-300 px-2 py-0.5 rounded font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              MISCLASSIFIED (SHORTCUT SUSPECT)
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs font-mono text-[#8C9397] pt-2">
                        {isCustomUpload ? "Custom upload: No ground-truth label" : "Awaiting ground-truth unmasking"}
                      </div>
                    )}
                  </div>

                  {/* Confounder Environment Card */}
                  <div className="real-glass-card rounded-xl p-4 border border-white/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-[#8A9195] uppercase block">
                      CONFOUNDER ENVIRONMENT
                    </span>

                    {prediction?.groundTruth ? (
                      <>
                        <div className="text-base font-mono font-bold text-[#1E292E]">
                          {prediction.groundTruth.context} Habitat
                        </div>
                        <div className="text-xs text-[#5F6568]">
                          {prediction.groundTruth.isConflict ? "Minority Conflict Background" : "Aligned Spurious Background"}
                        </div>
                        <div className="pt-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold border ${
                            prediction.groundTruth.isConflict
                              ? "text-amber-800 bg-amber-100/70 border-amber-300"
                              : "text-cyan-800 bg-cyan-100/70 border-cyan-300"
                          }`}>
                            {prediction.groundTruth.isConflict ? "High Shortcut Vulnerability" : "Standard Aligned Prior"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs font-mono text-[#8C9397] pt-2">
                        {isCustomUpload ? "Custom upload background: Unspecified" : "Environment Context: Pending"}
                      </div>
                    )}
                  </div>

                </div>

                {/* Softmax Probabilities Progress Bars */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono font-bold text-[#1E292E] uppercase">
                    Softmax Probabilities
                  </div>

                  {/* Waterbird Probability Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#1E292E] font-medium">Waterbird (Heron / Gull / Duck)</span>
                      <strong className="text-[#1E292E]">
                        {prediction?.probabilities?.Waterbird !== undefined 
                          ? `${(prediction.probabilities.Waterbird * 100).toFixed(1)}%` 
                          : "..."}
                      </strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1E292E] rounded-full transition-all duration-500" 
                        style={{ width: `${(prediction?.probabilities?.Waterbird || 0) * 100}%` }} 
                      />
                    </div>
                  </div>

                  {/* Landbird Probability Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#1E292E] font-medium">Landbird (Warbler / Sparrow / Woodpecker)</span>
                      <strong className="text-[#1E292E]">
                        {prediction?.probabilities?.Landbird !== undefined 
                          ? `${(prediction.probabilities.Landbird * 100).toFixed(1)}%` 
                          : "..."}
                      </strong>
                    </div>
                    <div className="w-full h-2 bg-[#EAE3D5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D96B6B] rounded-full transition-all duration-500" 
                        style={{ width: `${(prediction?.probabilities?.Landbird || 0) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Explainability & Diagnostics Quick Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Link to Grad-CAM Studio */}
                <div className="real-glass-card rounded-2xl p-5 border border-white/80 shadow-xs flex flex-col justify-between hover:border-[#D96B6B]/40 transition group cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#8C9397] uppercase">EXPLAINABILITY</span>
                      <ArrowUpRight className="w-4 h-4 text-[#7A8287] group-hover:text-[#D96B6B] transition" />
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                      Grad-CAM Studio
                    </h4>
                    <p className="text-xs text-[#616B70] mt-1 leading-relaxed">
                      Inspect layer-wise heatmaps and calculate spatial gradient density over avian plumage vs background.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EAE3D5] text-[11px] font-mono text-[#D96B6B] font-semibold">
                    Inspect Saliency Map →
                  </div>
                </div>

                {/* Link to Perturbation Lab */}
                <div className="real-glass-card rounded-2xl p-5 border border-white/80 shadow-xs flex flex-col justify-between hover:border-[#D96B6B]/40 transition group cursor-pointer">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#8C9397] uppercase">COUNTERFACTUAL</span>
                      <ArrowUpRight className="w-4 h-4 text-[#7A8287] group-hover:text-[#D96B6B] transition" />
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                      Perturbation Lab
                    </h4>
                    <p className="text-xs text-[#616B70] mt-1 leading-relaxed">
                      Invert backdrop context or apply Gaussian blur masks to measure prediction flip thresholds.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EAE3D5] text-[11px] font-mono text-[#D96B6B] font-semibold">
                    Test Background Swap →
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom Section: Recently Analyzed Queue */}
          <div className="pt-6 border-t border-[#EAE3D5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-editorial text-xl font-bold text-[#1E292E]">
                  Quick Benchmark Samples
                </h3>
                <span className="text-xs font-mono text-[#8C9397]">
                  (Click to load into workbench)
                </span>
              </div>

              <Link href="/dataset-explorer" className="text-xs font-mono text-[#D96B6B] font-semibold hover:underline">
                View Full Dataset Explorer →
              </Link>
            </div>

            {/* 4 Sample Specimens */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "WB-0001", name: "Black-footed Albatross", file: "001.Black_footed_Albatross/Black_Footed_Albatross_0046_18.jpg", label: "Waterbird / Ocean", isConflict: false },
                { id: "WB-0002", name: "Black-footed Albatross (Conflict)", file: "001.Black_footed_Albatross/Black_Footed_Albatross_0002_55.jpg", label: "Waterbird / Forest", isConflict: true },
                { id: "WB-0005", name: "Laysan Albatross", file: "002.Laysan_Albatross/Laysan_Albatross_0050_870.jpg", label: "Waterbird / Water", isConflict: false },
                { id: "WB-0041", name: "Scissor-tailed Flycatcher", file: "041.Scissor_tailed_Flycatcher/Scissor_Tailed_Flycatcher_0025_41870.jpg", label: "Landbird / Forest", isConflict: false }
              ].map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setSelectedFilename(sample.file);
                    setSpecimenId(sample.id);
                    setIsCustomUpload(false);
                    runDatasetPrediction("test", sample.file);
                  }}
                  className="real-glass-card rounded-xl p-3 border border-white/80 hover:border-[#D96B6B]/40 transition cursor-pointer space-y-2 group"
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-[#EFECE4]">
                    <Image
                      src={`${API_BASE_URL}/api/dataset/image?filename=${encodeURIComponent(sample.file)}`}
                      alt={sample.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    {sample.isConflict && (
                      <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500 text-white px-1 py-0.5 rounded font-bold">
                        Conflict
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-[#1E292E] truncate">
                    {sample.id}
                  </div>
                  <div className="text-[10px] text-[#616B70] truncate">
                    {sample.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

      </div>
    </div>
  );
}

export default function ImageAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F4EC] flex items-center justify-center font-mono text-xs text-[#788186]">
        Loading Image Analysis Workbench...
      </div>
    }>
      <ImageAnalysisContent />
    </Suspense>
  );
}
