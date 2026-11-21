"use client";

import React, { useState } from "react";
import Image from "next/image";
import Magnet from "./Magnet";
import HoloCard from "./HoloCard";
import { Eye, Layers, Sliders, AlertTriangle, ShieldCheck, Zap, Info, Maximize2 } from "lucide-react";

export default function ExplainabilityDarkSection() {
  const [selectedLayer, setSelectedLayer] = useState("layer4");
  const [overlayOpacity, setOverlayOpacity] = useState(75);

  const layerData: Record<
    string,
    {
      name: string;
      desc: string;
      targetScore: string;
      backgroundScore: string;
      confidence: string;
      hotspots: string;
    }
  > = {
    conv1: {
      name: "Conv1 (Low-Level)",
      desc: "Filters extract low-level edges, high frequency textures, and color transitions across both the bird and background foliage.",
      targetScore: "48.2%",
      backgroundScore: "51.8%",
      confidence: "Neutral",
      hotspots: "Edge boundaries across full frame",
    },
    layer2: {
      name: "Layer 2 (Textures)",
      desc: "Receptive fields grow to detect repetitive leaf patterns, wood grain, and feather ribbing.",
      targetScore: "36.4%",
      backgroundScore: "63.6%",
      confidence: "Shifting",
      hotspots: "Forest foliage texture patterns",
    },
    layer3: {
      name: "Layer 3 (Object Parts)",
      desc: "Intermediate representations begin prioritizing leafy canopy features as strong indicators of the 'landbird' class.",
      targetScore: "29.1%",
      backgroundScore: "70.9%",
      confidence: "Biased",
      hotspots: "Tree branches & leaf clusters",
    },
    layer4: {
      name: "Layer 4 (Decision CAM)",
      desc: "Final convolutional feature map anchors 78% of total gradient attribution onto surrounding leaves rather than the bird anatomy.",
      targetScore: "21.8%",
      backgroundScore: "78.2%",
      confidence: "99.4% (Landbird)",
      hotspots: "Dense foliage shortcut cluster",
    },
  };

  const current = layerData[selectedLayer];

  return (
    <section id="explainability" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Dark Slate Container with HoloCard */}
        <HoloCard
          wholeCard
          preset="shards"
          foilColor="#66D1FF"
          intensity={0.45}
          edgeSparkle={0.65}
          glare={0.4}
          tiltMax={4}
          radius={24}
          className="w-full"
        >
          <div className="morphism-dark rounded-3xl p-6 sm:p-8 md:p-12 text-slate-100 relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(10,20,25,0.4)]">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#D96B6B]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-cyan-300 font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Layer-Wise XAI Auditing</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-white leading-tight">
                See What Your Model Really Sees
              </h2>
              <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
                Inspect Grad-CAM, Integrated Gradients, and feature importance heatmaps side-by-side to verify if activations align with target objects or surrounding artifacts.
              </p>
            </div>

            {/* Layer Switcher Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
              {Object.keys(layerData).map((key) => (
                <Magnet key={key} padding={25} magnetStrength={3} scale={1.04} tilt={5}>
                  <button
                    onClick={() => setSelectedLayer(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedLayer === key
                        ? "bg-cyan-500 text-slate-950 font-semibold shadow-xs"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {layerData[key].name.split(" ")[0]}
                  </button>
                </Magnet>
              ))}
            </div>
          </div>

          {/* 3 Comparative Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 mb-8">
            {/* Panel 1: Original Image */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2.5">
                  <span>01. Input Image</span>
                  <span className="text-cyan-400">Test #412</span>
                </div>

                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  <Image
                    src="/images/hero_landbird.jpg"
                    alt="Original Yellow Warbler input"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                    Yellow Warbler (Landbird)
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 leading-snug">
                Raw input fed to ResNet-50. The yellow warbler is perched amidst lush green foliage.
              </div>
            </div>

            {/* Panel 2: Saliency Grad-CAM Heatmap */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2.5">
                  <span>02. Grad-CAM Heatmap</span>
                  <span className="text-[#FF8A8A] font-medium">{current.name.split(" ")[0]}</span>
                </div>

                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
                  {/* Base dimmed image */}
                  <Image
                    src="/images/hero_landbird.jpg"
                    alt="Grad-CAM activation map"
                    fill
                    className="object-cover opacity-25 filter grayscale"
                  />

                  {/* High Tech Glowing Heatmap Simulation */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      opacity: overlayOpacity / 100,
                      background: `
                        radial-gradient(circle at 75% 30%, rgba(255, 60, 60, 0.85) 0%, rgba(255, 160, 0, 0.7) 25%, rgba(0, 200, 255, 0.4) 50%, transparent 75%),
                        radial-gradient(circle at 25% 75%, rgba(255, 50, 50, 0.9) 0%, rgba(255, 200, 0, 0.65) 30%, rgba(0, 150, 255, 0.35) 55%, transparent 75%),
                        radial-gradient(circle at 45% 45%, rgba(40, 40, 180, 0.4) 0%, transparent 40%)
                      `,
                      mixBlendMode: "screen",
                    }}
                  />

                  {/* Indicator overlay */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    High Energy on Leaves
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300">
                    Bird Ignored (Low Heat)
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Opacity: {overlayOpacity}%</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Panel 3: Attribution Overlay & Decision */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2.5">
                  <span>03. Attribution Overlay</span>
                  <span className="text-[#FF9B9B] font-bold">Shortcut Detected</span>
                </div>

                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  <Image
                    src="/images/hero_landbird.jpg"
                    alt="Attribution overlay"
                    fill
                    className="object-cover"
                  />

                  {/* Bounding box around the bird showing low reliance */}
                  <div className="absolute top-[28%] left-[26%] w-[38%] h-[44%] border-2 border-dashed border-cyan-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-1 bg-cyan-400/10">
                    <span className="text-[9px] font-mono text-cyan-200 bg-black/70 px-1 py-0.5 rounded self-start">
                      Target: {current.targetScore}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-200 bg-black/70 px-1 py-0.5 rounded self-end">
                      Plumage
                    </span>
                  </div>

                  {/* Bounding box on the foliage background showing huge shortcut reliance */}
                  <div className="absolute top-[6%] right-[8%] w-[34%] h-[28%] border-2 border-[#D96B6B] rounded-lg pointer-events-none flex flex-col justify-between p-1 bg-[#D96B6B]/20">
                    <span className="text-[9px] font-mono text-white bg-[#C45050] px-1 py-0.5 rounded font-bold self-start">
                      Confounder: {current.backgroundScore}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-300">
                <span className="text-[#FF9E9E] font-semibold">Diagnosis: </span>
                {current.desc}
              </div>
            </div>
          </div>

          {/* Bottom Diagnostic Metrics Bar */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono relative z-10">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-slate-400">Target Object Reliance:</span>
              <span className="text-cyan-300 font-bold">{current.targetScore}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-slate-400">Spurious Background Reliance:</span>
              <span className="text-[#FF8585] font-bold">{current.backgroundScore}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-slate-400">Prediction Confidence:</span>
              <span className="text-emerald-400 font-bold">{current.confidence}</span>
            </div>
          </div>
        </div>
        </HoloCard>
      </div>
    </section>
  );
}

