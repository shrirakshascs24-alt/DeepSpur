"use client";

import React from "react";
import { Sparkles, Compass } from "lucide-react";

export default function ManifestoSection() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="morphism-dark rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl border border-white/10">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#D96B6B]/20 via-cyan-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Top Icon Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono text-cyan-200 mb-6">
              <Compass className="w-3.5 h-3.5" />
              <span>THE DEEPSPUR COMMITMENT</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl leading-tight font-bold mb-6 tracking-tight">
              Look beyond the prediction. <br className="hidden sm:inline" />
              Understand what your visual model{" "}
              <span className="italic font-normal text-[#FF9E9E]">actually learns.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
              Trustworthy computer vision cannot rely on top-1 accuracy alone. DeepSpur bridges empirical risk minimization with causal explainability — giving engineers and researchers the mathematical tools to build neural networks that see the bird, not the forest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

