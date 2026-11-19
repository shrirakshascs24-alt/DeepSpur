"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Magnet from "@/components/Magnet";
import { 
  Activity, Database, ShieldAlert, Cpu, Search, Terminal,
  Eye, Download, Play, CheckCircle2, AlertTriangle, ArrowUpRight,
  Sliders, Layers, Split, RefreshCw, AlertCircle, Sparkles,
  PieChart, GitBranch, Shield, Compass, FileText, ChevronRight,
  ChevronLeft, ArrowLeft, BarChart3, Shuffle, Filter, Check,
  Grid, List, Sparkle, ExternalLink
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DatasetItem {
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
  split: string;
}

interface DatasetListResponse {
  split: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: DatasetItem[];
}

export default function DatasetExplorerPage() {
  const router = useRouter();

  // Navigation & filter states
  const [activeSplit, setActiveSplit] = useState<string>("test");
  const [page, setPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterContext, setFilterContext] = useState<string>("all");
  const [filterBirdType, setFilterBirdType] = useState<string>("all");
  const [filterConflict, setFilterConflict] = useState<string>("all");
  const [blindedMode, setBlindedMode] = useState<boolean>(true);

  // Data states
  const [data, setData] = useState<DatasetListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DatasetItem | null>(null);

  // Split counts (from genuine dataset files)
  const splitCounts = {
    all: 11788,
    train: 4795,
    valid: 1199,
    test: 5794,
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        split: activeSplit,
        page: page.toString(),
        limit: "24",
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (filterContext !== "all") {
        params.append("context", filterContext);
      }
      if (filterBirdType !== "all") {
        params.append("bird_type", filterBirdType);
      }
      if (filterConflict === "conflict") {
        params.append("conflict_only", "true");
      } else if (filterConflict === "aligned") {
        params.append("conflict_only", "false");
      }

      const res = await fetch(`${API_BASE_URL}/api/dataset/items?${params.toString()}`, {
        cache: "no-store",
      }).catch(() => null);

      if (!res) {
        throw new Error("FastAPI backend is offline (http://localhost:8000).");
      }

      if (!res.ok) {
        throw new Error(`Failed to load dataset items: HTTP ${res.status}`);
      }

      const json: DatasetListResponse = await res.json();
      setData(json);

      // Auto-select first item if none selected or if selection out of current page
      if (json.items && json.items.length > 0 && !selectedItem) {
        setSelectedItem(json.items[0]);
      }
    } catch (err: unknown) {
      console.error("Dataset Explorer fetch error:", err);
      setError("Unable to connect to dataset API. Ensure FastAPI backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeSplit, page, filterContext, filterBirdType, filterConflict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterContext("all");
    setFilterBirdType("all");
    setFilterConflict("all");
    setPage(1);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= (data?.totalPages || 1)) {
      setPage(p);
      setJumpPageInput("");
    }
  };

  const handleRandomSelect = () => {
    if (data?.items && data.items.length > 0) {
      const randomIdx = Math.floor(Math.random() * data.items.length);
      setSelectedItem(data.items[randomIdx]);
    }
  };

  const handleNavigateToWorkbench = () => {
    if (!selectedItem) return;
    router.push(`/image-analysis?split=${selectedItem.split}&id=${selectedItem.id}&filename=${encodeURIComponent(selectedItem.filename)}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] flex relative overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="ambient-orb-coral w-[550px] h-[550px] top-[80px] left-[220px] opacity-25 pointer-events-none -z-10" />
      <div className="ambient-orb-amber w-[500px] h-[500px] top-[600px] right-[50px] opacity-20 pointer-events-none -z-10" />
      <div className="ambient-orb-cyan w-[450px] h-[450px] bottom-[100px] left-[350px] opacity-20 pointer-events-none -z-10" />

      {/* =========================================================================
          LEFT SIDEBAR
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
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#5F6568] hover:bg-white/60 hover:text-[#1E292E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#7A8287]" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#D96B6B] text-white font-medium shadow-sm cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-white" />
                    <span>Dataset Explorer</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/80 bg-white/20 px-1.5 py-0.5 rounded">
                    11,788
                  </span>
                </div>

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
            <strong className="text-[#D96B6B] font-bold">42.8%</strong>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-28">
        
        {/* Top Header / Search & Status Bar */}
        <header className="px-8 py-4.5 real-glass-subcard border-b border-white/60 bg-white/40 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 px-4 py-2 rounded-full real-glass-subcard bg-white/70 max-w-md w-full shadow-2xs border border-white/80">
            <Search className="w-4 h-4 text-[#7D858A]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search image ID, species, filename..."
              className="bg-transparent text-xs text-[#1E292E] placeholder-[#8C9498] focus:outline-none w-full font-mono"
            />
          </form>

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
              <span>Test Set: 5,794</span>
            </div>

            <button
              onClick={fetchItems}
              disabled={loading}
              title="Refresh dataset from backend"
              className="real-glass-pill p-2 rounded-full hover:bg-white text-[#4A555B] transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#D96B6B]" : ""}`} />
            </button>
          </div>
        </header>

        {/* Explorer Workspace */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[#B84E4E] bg-[#FCEBEA] border border-[#F5CCCC] font-mono text-[11px] font-semibold tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D96B6B] animate-ping" />
                <span>EMPIRICAL BENCHMARK • CUB-200-2011 &amp; PLACES SPURIOUS SUITE</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[40px] text-[#1E292E] font-bold leading-tight">
                Waterbirds Dataset Explorer
              </h1>
              <p className="mt-1.5 text-sm text-[#616B70] leading-relaxed max-w-3xl">
                Explore, filter, and inspect curated benchmark specimens across 4 visual quadrants without premature label leakage. Ground-truth labels remain blinded until analysis inference.
              </p>
            </div>

            {/* Quick Stat Pill Group */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="real-glass-card px-4 py-2 rounded-xl text-xs font-mono shadow-xs border border-white/80">
                <span className="text-[#8A9195] block text-[10px]">TOTAL</span>
                <strong className="text-[#1E292E] text-base">{splitCounts.all.toLocaleString()}</strong>
              </div>

              <div className="real-glass-card px-4 py-2 rounded-xl text-xs font-mono shadow-xs border border-white/80">
                <span className="text-[#8A9195] block text-[10px]">ACTIVE VIEW</span>
                <strong className="text-[#1E292E] text-base">
                  {data?.items ? data.items.length : 0} <span className="text-[11px] font-normal text-[#717A7F]">of {data?.total.toLocaleString() || "..."}</span>
                </strong>
              </div>

              <button 
                onClick={() => setBlindedMode(!blindedMode)}
                className={`px-3 py-2 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer ${
                  blindedMode 
                    ? "bg-[#D96B6B] text-white border-[#C95858] shadow-[0_4px_14px_rgba(217,107,107,0.3)]" 
                    : "real-glass-pill text-[#5F6568] bg-white/70"
                }`}
              >
                {blindedMode ? "BLINDED MODE: ACTIVE" : "UNMASK LABELS"}
              </button>
            </div>
          </div>

          {/* Filter Bar Card */}
          <div className="real-glass-board rounded-2xl p-4 sm:p-5 shadow-xs border border-white/80 space-y-4">
            
            {/* Top Row: Split Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Split Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl real-glass-subcard bg-black/5 w-full md:w-auto">
                <button
                  onClick={() => { setActiveSplit("train"); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer ${
                    activeSplit === "train" 
                      ? "bg-[#D96B6B] text-white shadow-xs font-semibold" 
                      : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Training ({splitCounts.train.toLocaleString()})
                </button>

                <button
                  onClick={() => { setActiveSplit("valid"); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer ${
                    activeSplit === "valid" 
                      ? "bg-[#D96B6B] text-white shadow-xs font-semibold" 
                      : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  Validation ({splitCounts.valid.toLocaleString()})
                </button>

                <button
                  onClick={() => { setActiveSplit("test"); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeSplit === "test" 
                      ? "bg-[#D96B6B] text-white shadow-xs font-semibold" 
                      : "text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeSplit === "test" ? "bg-white" : "bg-[#D96B6B]"}`} />
                  Testing ({splitCounts.test.toLocaleString()})
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="text-xs font-mono text-[#788186] hover:text-[#1E292E] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/60 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Bottom Row: Dropdown Selectors */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EAE3D5]/80 text-xs font-mono">
              
              {/* Visual Context */}
              <div className="flex items-center gap-2">
                <span className="text-[#8C9397]">Visual Context:</span>
                <select
                  value={filterContext}
                  onChange={(e) => { setFilterContext(e.target.value); setPage(1); }}
                  className="real-glass-subcard px-3 py-1.5 rounded-lg bg-white/80 text-[#1E292E] border border-white/90 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Environments</option>
                  <option value="land">Land (Forest/Bamboo)</option>
                  <option value="water">Water (Ocean/Lake)</option>
                </select>
              </div>

              {/* Bird Species Target */}
              <div className="flex items-center gap-2">
                <span className="text-[#8C9397]">Target Species:</span>
                <select
                  value={filterBirdType}
                  onChange={(e) => { setFilterBirdType(e.target.value); setPage(1); }}
                  className="real-glass-subcard px-3 py-1.5 rounded-lg bg-white/80 text-[#1E292E] border border-white/90 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Species</option>
                  <option value="waterbird">Waterbirds</option>
                  <option value="landbird">Landbirds</option>
                </select>
              </div>

              {/* Spurious Alignment Status */}
              <div className="flex items-center gap-2">
                <span className="text-[#8C9397]">Quadrant Status:</span>
                <select
                  value={filterConflict}
                  onChange={(e) => { setFilterConflict(e.target.value); setPage(1); }}
                  className="real-glass-subcard px-3 py-1.5 rounded-lg bg-white/80 text-[#1E292E] border border-white/90 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Quadrants</option>
                  <option value="aligned">Aligned Majority (Water/Water, Land/Land)</option>
                  <option value="conflict">Counterfactual Minority (Water/Land, Land/Water)</option>
                </select>
              </div>

              {/* Resolution badge */}
              <div className="ml-auto real-glass-pill px-3 py-1 rounded-md text-[11px] text-[#788186] bg-white/50">
                ResNet 224×224 px
              </div>
            </div>
          </div>

          {/* Gallery Subheader */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-2xl font-bold text-[#1E292E]">
                Curated Specimens
              </h2>
              <span className="text-[11px] font-mono text-[#8C9397]">
                ({blindedMode ? "Blinded protocol: ground-truth unmasked upon workbench trigger" : "Ground-truth unmasked"})
              </span>
            </div>

            <div className="text-xs font-mono text-[#788186]">
              {data ? `Showing ${(page - 1) * 24 + 1}–${Math.min(page * 24, data.total)} of ${data.total.toLocaleString()} items` : "Loading..."}
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="p-16 real-glass-card rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#D96B6B] animate-spin" />
              <div className="text-sm font-mono text-[#1E292E] font-semibold">Loading dataset specimens...</div>
              <p className="text-xs text-[#717A7F]">Serving images securely from Waterbirds benchmark directory.</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-12 rounded-3xl real-glass-card border border-rose-200 bg-rose-50/50 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
              <div className="text-sm font-mono text-rose-900 font-bold">FastAPI Dataset Endpoint Offline</div>
              <p className="text-xs text-rose-700 max-w-md">{error}</p>
              <button 
                onClick={fetchItems}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-mono text-white bg-[#D96B6B] hover:bg-[#C95858] transition cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && data?.items && data.items.length === 0 && (
            <div className="p-16 real-glass-card rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
              <Database className="w-8 h-8 text-[#A6AFB4]" />
              <div className="text-base font-editorial font-bold text-[#1E292E]">No matching specimens found</div>
              <p className="text-xs text-[#717A7F] max-w-sm">No items match the active combination of split, visual context, and species filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-mono text-[#1E292E] real-glass-subcard hover:bg-white transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Specimen Card Grid (4 columns) */}
          {!loading && !error && data?.items && data.items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {data.items.map((item) => {
                const isSelected = selectedItem?.filename === item.filename;

                return (
                  <div
                    key={item.filename}
                    onClick={() => setSelectedItem(item)}
                    className={`rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer group relative ${
                      isSelected 
                        ? "real-glass-board border-2 border-[#D96B6B] shadow-[0_8px_24px_rgba(217,107,107,0.18)] scale-[1.01]" 
                        : "real-glass-card border border-white/80 hover:border-[#D96B6B]/40 hover:scale-[1.005] shadow-xs"
                    }`}
                  >
                    {/* Top Image Preview Container */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-[#EFECE4] border border-white/90">
                      <Image
                        src={`${API_BASE_URL}/api/dataset/image?filename=${encodeURIComponent(item.filename)}`}
                        alt={item.species}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="text-[9px] font-mono bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                          224 × 224 px
                        </span>

                        <span className="text-[9px] font-mono bg-[#D96B6B] text-white px-2 py-0.5 rounded-md font-semibold shadow-xs">
                          {activeSplit.toUpperCase()} #{item.index}
                        </span>
                      </div>

                      {/* Selected Indicator Banner */}
                      {isSelected && (
                        <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 bg-[#D96B6B] text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                          <span>SELECTED</span>
                        </div>
                      )}

                      {/* Rare Quadrant Flag */}
                      {item.isConflict && (
                        <div className="absolute bottom-2.5 right-2.5 bg-amber-500/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shadow-xs">
                          Minority Conflict
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-mono font-bold text-[#1E292E] group-hover:text-[#D96B6B] transition-colors">
                          Specimen #{item.id}
                        </strong>

                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "border-[#D96B6B] bg-[#D96B6B]" : "border-[#B0B7BB] group-hover:border-[#788186]"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="text-[11px] text-[#616B70] truncate font-medium">
                        {item.species}
                      </div>

                      {/* Metadata Badges Footer */}
                      <div className="pt-2 border-t border-[#EAE3D5]/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#788186] bg-black/5 px-2 py-0.5 rounded">
                          {blindedMode ? "Blinded Class" : `${item.label} / ${item.context}`}
                        </span>

                        <span className="text-[#D96B6B] font-semibold hover:underline">
                          Quick Inspect →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && data && data.totalPages > 1 && (
            <div className="pt-6 border-t border-[#EAE3D5] flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="text-xs font-mono text-[#6A7378]">
                Showing {((page - 1) * 24) + 1}–{Math.min(page * 24, data.total)} of {data.total.toLocaleString()} items
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl real-glass-subcard text-[#5F6568] hover:text-[#1E292E] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <button
                  onClick={() => setPage(1)}
                  className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer ${
                    page === 1 ? "bg-[#D96B6B] text-white shadow-xs" : "real-glass-subcard text-[#5F6568] hover:text-[#1E292E]"
                  }`}
                >
                  1
                </button>

                {page > 3 && <span className="px-1 text-[#8C9397]">...</span>}

                {page > 2 && page < data.totalPages && (
                  <button
                    onClick={() => setPage(page)}
                    className="w-8 h-8 rounded-xl font-bold bg-[#D96B6B] text-white shadow-xs"
                  >
                    {page}
                  </button>
                )}

                {page < data.totalPages - 2 && <span className="px-1 text-[#8C9397]">...</span>}

                {data.totalPages > 1 && (
                  <button
                    onClick={() => setPage(data.totalPages)}
                    className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer ${
                      page === data.totalPages ? "bg-[#D96B6B] text-white shadow-xs" : "real-glass-subcard text-[#5F6568] hover:text-[#1E292E]"
                    }`}
                  >
                    {data.totalPages}
                  </button>
                )}

                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                  className="p-2 rounded-xl real-glass-subcard text-[#5F6568] hover:text-[#1E292E] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump to Page Form */}
              <form onSubmit={handleJumpPage} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#8C9397]">JUMP TO:</span>
                <input
                  type="number"
                  min="1"
                  max={data.totalPages}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  placeholder="p."
                  className="w-14 px-2 py-1 rounded-lg real-glass-subcard bg-white/70 border border-white/80 text-[#1E292E] text-center focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg real-glass-pill hover:bg-white text-[#5F6568] font-bold transition cursor-pointer"
                >
                  GO
                </button>
              </form>
            </div>
          )}

        </main>

        {/* =========================================================================
            BOTTOM FLOATING ACTION BAR (EXACT MATCH TO STITCH SPECIFICATION)
            ========================================================================= */}
        {selectedItem && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl w-full px-4">
            <div className="real-glass-board rounded-2xl p-3 border border-white/90 shadow-[0_12px_36px_rgba(30,41,46,0.15)] flex items-center justify-between gap-4 backdrop-blur-xl bg-white/85">
              
              {/* Selected Specimen Preview */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-white/90 bg-[#EFECE4]">
                  <Image
                    src={`${API_BASE_URL}/api/dataset/image?filename=${encodeURIComponent(selectedItem.filename)}`}
                    alt={selectedItem.species}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="font-mono text-xs">
                  <div className="font-bold text-[#1E292E] flex items-center gap-2">
                    <span>Specimen #{selectedItem.id}</span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">
                      {selectedItem.split.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#616B70] truncate max-w-xs">
                    {selectedItem.species}
                  </div>
                  <div className="text-[10px] text-[#8C9397]">
                    {blindedMode ? "Blind Status: Active" : `${selectedItem.label} on ${selectedItem.context}`}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleRandomSelect}
                  title="Pick a random image on this page"
                  className="real-glass-pill px-3 py-2 rounded-xl text-xs font-mono text-[#5F6568] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>

                <Magnet padding={30} magnetStrength={3} scale={1.03}>
                  <button
                    onClick={handleNavigateToWorkbench}
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_6px_18px_rgba(217,107,107,0.35)] transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Analyze Selected in Workbench</span>
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </button>
                </Magnet>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
