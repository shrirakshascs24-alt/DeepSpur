"use client";

import React, { useState } from "react";
import Image from "next/image";
import WebThreads from "./WebThreads";
import Magnet from "./Magnet";
import HoloCard from "./HoloCard";
import { 
  ArrowRight, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, 
  ChevronRight, BarChart3, SlidersHorizontal, RefreshCw, Search,
  Calendar, CheckSquare, Square, Layers, Eye, Zap, MoreHorizontal,
  FolderGit2, Activity, Split
} from "lucide-react";

interface DatasetPreset {
  id: string;
  name: string;
  shortcutRisk: string;
  overallAcc: string;
  worstGroupAcc: string;
  dropRate: string;
  samples: string;
}

const DATASETS: DatasetPreset[] = [
  { id: "waterbirds", name: "Waterbirds-95", shortcutRisk: "64.8%", overallAcc: "94.6%", worstGroupAcc: "42.8%", dropRate: "-51.8%", samples: "5,794" },
  { id: "celeba", name: "CelebA Blond", shortcutRisk: "58.2%", overallAcc: "95.1%", worstGroupAcc: "41.6%", dropRate: "-53.5%", samples: "162,770" },
  { id: "civilcomments", name: "CivilComments", shortcutRisk: "47.3%", overallAcc: "92.4%", worstGroupAcc: "57.1%", dropRate: "-35.3%", samples: "238,756" },
];

export default function HeroSection() {
  const [activeDataset, setActiveDataset] = useState<DatasetPreset>(DATASETS[0]);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Audit Waterbird / Water (Aligned)", checked: true, time: "98.4% Acc", tag: "Majority" },
    { id: 2, text: "Audit Landbird / Water (Conflict)", checked: true, time: "42.8% Acc", tag: "Spurious Drop", alert: true },
    { id: 3, text: "Counterfactual Background Swap", checked: false, time: "Inversion", tag: "Perturbation" },
    { id: 4, text: "Run Group DRO Regularization", checked: false, time: "Mitigation", tag: "Optimization" },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  return (
    <div>
      {/* =========================================================================
          SECTION 1: HERO VIEWPORT (FULL-SCREEN 100vh — FILLS ENTIRE SCREEN)
          ========================================================================= */}
      <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-20 pb-16">
        {/* Full-viewport WebThreads canvas */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto -z-10">
          <WebThreads
            colors={['#D96B6B', '#E89D78', '#25333A', '#C85656', '#E27D7D']}
            coreColor="#FFFFFF"
            backgroundColor="transparent"
            threadCount={7}
            spread={0.22}
            speed={0.18}
            frequency={4.5}
            position={0.5}
            pinch={0.5}
            thickness={1.25}
            glow={0.03}
            falloff={0.55}
            brightness={0.84}
            opacity={0.85}
            shimmer={true}
            mouseInteraction={true}
            mouseStrength={0.55}
            pulseOnClick={true}
            fade={0.08}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full flex flex-col items-center my-auto">
          
          {/* Top Tag Badge */}
          <div className="flex justify-center mb-6">
            <div className="real-glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#B84E4E] font-mono text-[11px] font-medium tracking-wider uppercase shadow-xs bg-white/80">
              <span className="w-2 h-2 rounded-full bg-[#D96B6B] animate-ping" />
              <span>An Investigation into Spurious Correlations in Computer Vision</span>
            </div>
          </div>

          {/* Large Editorial Headline */}
          <div className="text-center max-w-5xl mx-auto mb-7">
            <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.1] tracking-[-0.02em] text-[#161D20] drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
              <span className="md:inline block whitespace-normal md:whitespace-nowrap">Is your model learning the bird, or</span>{" "}
              <span className="md:inline block whitespace-normal md:whitespace-nowrap mt-1 md:mt-0">
                just its <span className="italic text-[#D96B6B] font-normal">background?</span>
              </span>
            </h1>
            
            {/* 2-Line Subtitle expanded horizontally */}
            <p className="mt-7 text-lg sm:text-xl text-[#242D31] max-w-5xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              <span className="block md:whitespace-nowrap">
                DeepSpur audits shortcut biases and background confounding in visual neural networks —
              </span>
              <span className="block mt-1 md:whitespace-nowrap">
                diagnosing brittle representations and stress-testing models under real-world domain shifts.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Magnet padding={70} magnetStrength={2.8} tilt={8} scale={1.03}>
              <button
                onClick={() => {
                  const el = document.getElementById("glass-diagnostic-board");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_12px_30px_rgba(217,107,107,0.38)] transition-all duration-200 active:scale-95 cursor-pointer relative z-20"
              >
                <span>Explore Diagnostic Benchmark</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </Magnet>

            <Magnet padding={70} magnetStrength={2.8} tilt={8} scale={1.03}>
              <button
                onClick={() => {
                  const el = document.getElementById("explainability");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="real-glass-pill inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-medium text-[#1E292E] hover:bg-white transition-all duration-200 hover:shadow-md cursor-pointer relative z-20 bg-white/80"
              >
                <Sparkles className="w-4 h-4 text-[#D96B6B]" />
                <span>Layer-wise XAI Sandbox</span>
              </button>
            </Magnet>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: DIAGNOSTIC WORKSPACE
          Begins below the fold when user scrolls down — 100% clean background!
          ========================================================================= */}
      <div className="pt-16 pb-24 relative z-10">
        <div id="glass-diagnostic-board" className="relative mx-auto max-w-6xl px-6 sm:px-8">
          
          {/* Top Floating Glass Search / Capsule Bar */}
          <div className="flex justify-center -mb-5 relative z-20">
            <div className="real-glass-subcard px-6 py-2.5 rounded-full flex items-center gap-3 shadow-lg border border-white/80 max-w-md w-full bg-white/85">
              <Search className="w-4 h-4 text-[#737C81]" />
              <input
                type="text"
                placeholder="Search models, spurious cues, layer weights..."
                className="bg-transparent text-xs text-[#1E292E] placeholder-[#737C81] focus:outline-none w-full font-mono"
                readOnly
                value={`Benchmark: ${activeDataset.name} (ResNet-50 ERM)`}
              />
              <span className="text-[10px] font-mono text-[#D96B6B] bg-[#FDEAEA] px-2 py-0.5 rounded-md font-semibold">
                AUDIT
              </span>
            </div>
          </div>

          {/* Master Large Glass Sheet with HoloCard */}
          <HoloCard
            wholeCard
            preset="cosmos"
            foilColor="#E6BABA"
            intensity={0.42}
            edgeSparkle={0.6}
            glare={0.35}
            tiltMax={4}
            radius={24}
            className="w-full"
          >
            <div className="real-glass-board glass-sheen rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_35px_80px_-15px_rgba(40,30,20,0.18)]">
            
            {/* Top Toolbar Inside Glass Board */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-7 border-b border-white/60 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#25333A] flex items-center justify-center shadow-md">
                  <div className="w-3.5 h-3.5 rounded bg-[#D96B6B] transform rotate-45" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#1E292E] leading-tight">
                    DeepSpur Diagnostic Workspace
                  </h3>
                  <span className="text-[11px] font-mono text-[#6C757A]">
                    REAL-TIME SPURIOUS CORRELATION AUDITOR
                  </span>
                </div>
              </div>

              {/* Dataset preset switcher */}
              <div className="flex items-center real-glass-subcard p-1 rounded-xl gap-1 bg-white/60">
                {DATASETS.map((d) => (
                  <Magnet key={d.id} padding={25} magnetStrength={3} scale={1.04} tilt={4}>
                    <button
                      onClick={() => setActiveDataset(d)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                        activeDataset.id === d.id
                          ? "bg-white text-[#1E292E] font-bold shadow-xs"
                          : "text-[#626A6F] hover:text-[#1E292E]"
                      }`}
                    >
                      {d.name}
                    </button>
                  </Magnet>
                ))}
              </div>
            </div>

            {/* 3 Main Glass Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PANEL 1: Diagnostic Task Manager (4 cols) */}
              <div className="lg:col-span-4 real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                      Audit Manager
                    </h4>
                    <div className="w-7 h-7 rounded-lg real-glass-subcard flex items-center justify-center text-[#555E62]">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="text-xs font-mono text-[#D96B6B] flex items-center gap-1.5 font-semibold mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D96B6B]" />
                    <span>Active Test Slices</span>
                  </div>

                  {/* Task List items with interactive checkboxes */}
                  <div className="space-y-2.5">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-2.5 rounded-xl real-glass-subcard cursor-pointer transition-all hover:bg-white/70 flex items-center justify-between ${
                          task.alert ? "border-l-3 border-l-[#D96B6B]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {task.checked ? (
                            <CheckSquare className="w-4 h-4 text-[#D96B6B] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8C9498] shrink-0" />
                          )}
                          <span className={`text-xs ${task.checked ? "text-[#1E292E] font-medium" : "text-[#717A7E]"}`}>
                            {task.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#838B90] shrink-0 ml-2">
                          {task.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Quick Add / Input Box */}
                <div className="mt-5 pt-4 border-t border-white/50">
                  <span className="text-[11px] font-mono text-[#586267] font-semibold mb-2 block">
                    + Quick Slice Probe
                  </span>
                  <div className="real-glass-subcard p-2 rounded-xl flex items-center justify-between bg-white/60">
                    <span className="text-xs text-[#7F878C] font-mono">
                      Query sample #412...
                    </span>
                    <Magnet padding={30} magnetStrength={2.5} scale={1.05} tilt={6}>
                      <button className="px-2.5 py-1 rounded-lg bg-[#1E292E] text-white text-[10px] font-mono font-medium hover:bg-[#2C3B42] transition-colors cursor-pointer">
                        Run
                      </button>
                    </Magnet>
                  </div>
                </div>
              </div>

              {/* PANEL 2: Audit Analytics & Progress (4 cols) */}
              <div className="lg:col-span-4 real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                      Spurious Analytics
                    </h4>
                    <MoreHorizontal className="w-4 h-4 text-[#666F74] cursor-pointer" />
                  </div>

                  {/* 4 Nested Metric Chips */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    <div className="real-glass-subcard p-3 rounded-xl">
                      <span className="text-[10px] font-mono uppercase text-[#737C81] block">
                        Total Eval
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold font-mono text-[#1E292E]">
                          {activeDataset.samples}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          100%
                        </span>
                      </div>
                    </div>

                    <div className="real-glass-subcard p-3 rounded-xl">
                      <span className="text-[10px] font-mono uppercase text-[#737C81] block">
                        Overall Acc
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold font-mono text-[#1E292E]">
                          {activeDataset.overallAcc}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          +12%
                        </span>
                      </div>
                    </div>

                    <div className="real-glass-subcard p-3 rounded-xl border border-[#F2C6C6] bg-[#FFF5F5]/60">
                      <span className="text-[10px] font-mono uppercase text-[#C45050] font-semibold block">
                        Worst Group
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold font-mono text-[#D96B6B]">
                          {activeDataset.worstGroupAcc}
                        </span>
                        <span className="text-[10px] font-mono text-[#C45050] font-bold">
                          {activeDataset.dropRate}
                        </span>
                      </div>
                    </div>

                    <div className="real-glass-subcard p-3 rounded-xl">
                      <span className="text-[10px] font-mono uppercase text-[#737C81] block">
                        Shortcut Risk
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-bold font-mono text-[#1E292E]">
                          {activeDataset.shortcutRisk}
                        </span>
                        <span className="text-[10px] font-mono text-[#D96B6B] font-bold">
                          High
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Layer Progress Bar Chart */}
                  <div className="real-glass-subcard p-3.5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold text-[#1E292E]">
                        Layer Spurious Ratio
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D96B6B]" />
                        <span className="w-2 h-2 rounded-full bg-[#25333A]" />
                      </div>
                    </div>

                    {/* Glowing Bar Visualizer */}
                    <div className="flex items-end justify-between h-20 px-2 pt-2 gap-2">
                      {[
                        { label: "Conv1", height: "45%", val: "48%" },
                        { label: "L1", height: "55%", val: "55%" },
                        { label: "L2", height: "64%", val: "64%" },
                        { label: "L3", height: "72%", val: "72%" },
                        { label: "L4", height: "92%", val: "78%", highlight: true },
                        { label: "FC", height: "85%", val: "85%" },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 shadow-sm ${
                              bar.highlight
                                ? "bg-gradient-to-t from-[#C85656] to-[#E88585] shadow-[0_0_12px_rgba(217,107,107,0.5)]"
                                : "bg-gradient-to-t from-[#25333A] to-[#485E6B]"
                            }`}
                            style={{ height: bar.height }}
                          />
                          <span className="text-[9px] font-mono text-[#788185]">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between text-[11px] font-mono text-[#6A7378]">
                  <span>Vulnerability Margin:</span>
                  <strong className="text-[#D96B6B]">{activeDataset.dropRate} Drop</strong>
                </div>
              </div>

              {/* PANEL 3: Visual Slices & Telemetry */}
              <div className="lg:col-span-4 real-glass-card rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-editorial text-lg font-bold text-[#1E292E]">
                      Visual Slices
                    </h4>
                    <div className="w-7 h-7 rounded-lg real-glass-subcard flex items-center justify-center text-[#555E62]">
                      <Eye className="w-3.5 h-3.5 text-[#D96B6B]" />
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[#D96B6B] flex items-center gap-1.5 font-semibold mb-3">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Inspected Test Samples</span>
                  </span>

                  {/* 2 Photographic Cards Side-by-Side */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/80 shadow-xs">
                      <Image
                        src="/images/hero_waterbird.jpg"
                        alt="Waterbird sample"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white">
                        Waterbird
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                        98.4%
                      </div>
                    </div>

                    <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/80 shadow-xs">
                      <Image
                        src="/images/hero_landbird.jpg"
                        alt="Landbird sample"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white">
                        Landbird
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                        97.1%
                      </div>
                    </div>
                  </div>

                  {/* Recent Diagnostic Messages */}
                  <div className="space-y-2">
                    <div className="real-glass-subcard p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D96B6B] animate-pulse" />
                        <div>
                          <span className="text-xs font-bold text-[#1E292E] block leading-none">
                            Waterbird on Land
                          </span>
                          <span className="text-[10px] text-[#717A7E]">
                            Minority slice collapse detected
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#D96B6B] font-bold">
                        42.8%
                      </span>
                    </div>

                    <div className="real-glass-subcard p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <span className="text-xs font-bold text-[#1E292E] block leading-none">
                            Waterbird on Water
                          </span>
                          <span className="text-[10px] text-[#717A7E]">
                            Majority slice aligned
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        95.2%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between text-[11px] font-mono text-[#6A7378]">
                  <span>Telemetry: Active</span>
                  <span className="text-[#1E292E] font-bold">4 Groups Verified</span>
                </div>
              </div>

            </div>

          </div>
          </HoloCard>
        </div>

      </div>
    </div>
  );
}
