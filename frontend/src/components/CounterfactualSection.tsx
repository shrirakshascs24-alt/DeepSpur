"use client";

import React, { useState } from "react";
import Image from "next/image";
import Magnet from "./Magnet";
import HoloCard from "./HoloCard";
import { ArrowRight, RefreshCw, AlertOctagon, CheckCircle2, Shuffle, Sparkles } from "lucide-react";

export default function CounterfactualSection() {
  const [swapped, setSwapped] = useState(false);

  return (
    <section className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>Counterfactual Invariance</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            What happens when the background{" "}
            <span className="italic font-normal text-[#D96B6B]">changes?</span>
          </h2>
          <p className="mt-3 text-[#646B6F] text-base leading-relaxed">
            A single environmental perturbation causes state-of-the-art vision models to flip their output, revealing that standard empirical risk minimization trains background detectors in disguise.
          </p>
        </div>

        {/* Counterfactual Demonstration Box */}
        <div className="real-glass-board rounded-3xl p-6 sm:p-8 md:p-10 max-w-5xl mx-auto shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
            {/* Left Whole Card: Aligned Original with HoloCard */}
            <HoloCard
              wholeCard
              preset="cosmos"
              foilColor="#C2E6EC"
              intensity={0.45}
              edgeSparkle={0.65}
              glare={0.4}
              tiltMax={7}
              radius={18}
              className="w-full h-full"
            >
              <div className="real-glass-card rounded-2xl p-5 border border-white/80 shadow-md flex flex-col justify-between transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      Aligned Context
                    </span>
                    <span className="text-[#788085]">Sample ID: #882</span>
                  </div>

                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-4 border border-[#E8E2D5]">
                    <Image
                      src="/images/water_water.jpg"
                      alt="Waterbird on water background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                      Target: Waterbird | Env: Water
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#6D757A]">Ground Truth Label:</span>
                      <strong className="text-[#1E292E] font-mono">Waterbird</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F0EBE0]">
                      <span className="text-[#6D757A]">Model Prediction:</span>
                      <strong className="text-emerald-700 font-mono">Waterbird (99.1%)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#6D757A]">Classification Status:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE7DB] text-[11px] text-[#788186]">
                  Both bird plumage and lake pixels agree with training prior.
                </div>
              </div>
            </HoloCard>

            {/* Middle Interactive Swap Trigger Button (Floating on desktop) */}
            <div className="md:absolute md:left-1/2 md:-translate-x-1/2 z-20 flex justify-center self-center">
              <Magnet padding={60} magnetStrength={2.5} scale={1.05} tilt={8}>
                <button
                  onClick={() => setSwapped(!swapped)}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E292E] hover:bg-[#2C3C44] text-white text-xs font-mono font-medium shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#D96B6B] transition-transform duration-300 group-hover:rotate-180" />
                  <span>{swapped ? "Reset Background" : "Swap Background"}</span>
                </button>
              </Magnet>
            </div>

            {/* Right Whole Card: Shifted / Swapped Context with HoloCard */}
            <HoloCard
              wholeCard
              preset="shards"
              foilColor="#FFB5B5"
              intensity={0.5}
              edgeSparkle={0.7}
              glare={0.45}
              tiltMax={7}
              radius={18}
              className="w-full h-full"
            >
              <div className="bg-[#FFF8F8] rounded-2xl p-5 border border-[#F2C8C8] shadow-sm flex flex-col justify-between transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-[#D96B6B] text-white font-semibold">
                      Counterfactual Shift
                    </span>
                    <span className="text-[#C45252] font-semibold">Prediction Flipped!</span>
                  </div>

                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-4 border border-[#F2C8C8]">
                    <Image
                      src={swapped ? "/images/water_land.jpg" : "/images/water_land.jpg"}
                      alt="Waterbird on land background"
                      fill
                      className="object-cover transition-all duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                      Target: Waterbird | Env: Forest Foliage
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[#C45050] text-white text-[10px] font-mono font-bold">
                      Misclassified
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F7DEDE]">
                      <span className="text-[#6D757A]">Ground Truth Label:</span>
                      <strong className="text-[#1E292E] font-mono">Waterbird</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F7DEDE]">
                      <span className="text-[#6D757A]">Model Prediction:</span>
                      <strong className="text-[#C45050] font-mono">Landbird (87.4%)</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#6D757A]">Classification Status:</span>
                      <span className="inline-flex items-center gap-1 text-[#C45050] font-semibold font-mono">
                        <AlertOctagon className="w-3.5 h-3.5" /> Severe Failure
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2D7D7] text-[11px] text-[#A64A4A] font-medium">
                  The neural network detected tree foliage and immediately overrode bird anatomy.
                </div>
              </div>
            </HoloCard>
          </div>

          {/* Explanatory summary box */}
          <div className="mt-8 pt-6 border-t border-[#EAE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#5C6569] leading-relaxed max-w-3xl">
              <strong className="text-[#1E292E] font-semibold">The Diagnostic Finding: </strong>
              The model achieves 94.6% standard accuracy on the test set, yet fails on this counterfactual test because 78% of its decision logic was derived from surrounding pixels rather than object geometry.
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[11px] font-mono text-[#8C9397] block">
                INVARIANCE SCORE
              </span>
              <span className="text-xl font-mono font-bold text-[#D96B6B]">12.6% Invariant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

