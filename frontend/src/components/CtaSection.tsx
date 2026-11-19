"use client";

import React from "react";
import Magnet from "./Magnet";
import HoloCard from "./HoloCard";
import { ArrowRight, Sparkles, Terminal, FileText, CheckCircle2 } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <HoloCard
          wholeCard
          preset="bursts"
          foilColor="#FFC8C8"
          intensity={0.48}
          edgeSparkle={0.65}
          glare={0.4}
          tiltMax={5}
          radius={24}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="real-glass-board rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden border border-white/80">
            {/* Subtle Ambient Radial Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#F7D8D8]/40 via-[#FDF5ED]/30 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE8] border border-[#E8D4CE] text-[#B84E4E] font-mono text-[11px] font-medium uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#D96B6B]" />
                <span>Get Started with DeepSpur</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1E292E] font-bold leading-tight mb-4">
                Understand the model beyond its prediction.
              </h2>

              <p className="text-[#616B70] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
                Audit your models for hidden biases, diagnose failure modes under distribution shifts, and regularize representations for true invariant performance.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Magnet padding={60} magnetStrength={2.8} scale={1.03} tilt={7}>
                  <button
                    onClick={() => {
                      const el = document.getElementById("glass-diagnostic-board");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium text-white bg-[#D96B6B] hover:bg-[#C95858] shadow-[0_10px_25px_rgba(217,107,107,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <span>Launch Interactive Sandbox</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </Magnet>

                <Magnet padding={60} magnetStrength={2.8} scale={1.03} tilt={7}>
                  <button
                    onClick={() => {
                      const el = document.getElementById("waterbirds");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-[#2E3B40] bg-white hover:bg-[#FAF7F2] border border-[#DDD6C8] shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#788085]" />
                    <span>Read Benchmark Specs</span>
                  </button>
                </Magnet>
              </div>

              {/* Micro assurance */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#838B8F]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Open Source Benchmark
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PyTorch 2.x Native
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Backend Dependency
                </span>
              </div>
            </div>
          </div>
        </HoloCard>
      </div>
    </section>
  );
}

