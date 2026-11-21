"use client";

import React from "react";
import Magnet from "./Magnet";
import { FileText, ArrowUp, ExternalLink, ShieldCheck } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#EAE3D5] bg-[#F7F4EE] pt-16 pb-12 text-[#656E73] text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#E6DFD1]">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#25333A] flex items-center justify-center shadow-xs">
                <div className="w-3 h-3 rounded bg-[#D96B6B] transform rotate-45" />
              </div>
              <span className="font-editorial text-lg tracking-wider font-semibold text-[#1E292E] uppercase">
                DEEPSPUR
              </span>
            </div>
            <p className="text-xs text-[#6F767B] leading-relaxed max-w-sm">
              An open-source research initiative investigating spurious correlations, shortcut learning, and worst-group generalization in deep vision architectures.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8C9397]">
              Built with Next.js, React 19, and Tailwind CSS.
            </div>
          </div>

          {/* Col 2: Benchmark Citations */}
          <div>
            <h5 className="font-mono text-[11px] uppercase tracking-wider text-[#1E292E] font-semibold mb-3">
              Research Foundations
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[#1E292E] transition-colors">
                <span className="font-medium text-[#2C353A] block">Waterbirds Benchmark</span>
                <span className="text-[11px] text-[#868E93]">Sagawa et al., ICLR 2020</span>
              </li>
              <li className="hover:text-[#1E292E] transition-colors">
                <span className="font-medium text-[#2C353A] block">Shortcut Learning in DNNS</span>
                <span className="text-[11px] text-[#868E93]">Geirhos et al., Nature MI 2020</span>
              </li>
              <li className="hover:text-[#1E292E] transition-colors">
                <span className="font-medium text-[#2C353A] block">Just Train Twice (JTT)</span>
                <span className="text-[11px] text-[#868E93]">Liu et al., ICML 2021</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Back to top */}
          <div className="flex flex-col justify-between">
            <div>
              <h5 className="font-mono text-[11px] uppercase tracking-wider text-[#1E292E] font-semibold mb-3">
                Navigation
              </h5>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <a href="#causality" className="hover:text-[#1E292E] transition-colors">
                    Overview & Causality
                  </a>
                </li>
                <li>
                  <a href="#pipeline" className="hover:text-[#1E292E] transition-colors">
                    Audit Pipeline
                  </a>
                </li>
                <li>
                  <a href="#ecosystem" className="hover:text-[#1E292E] transition-colors">
                    Diagnostic Ecosystem
                  </a>
                </li>
                <li>
                  <a href="#waterbirds" className="hover:text-[#1E292E] transition-colors">
                    Waterbirds Quadrants
                  </a>
                </li>
                <li>
                  <a href="#explainability" className="hover:text-[#1E292E] transition-colors">
                    XAI & Heatmaps
                  </a>
                </li>
                <li>
                  <a href="#discrepancy" className="hover:text-[#1E292E] transition-colors">
                    Accuracy Discrepancy
                  </a>
                </li>
              </ul>
            </div>

            <Magnet padding={40} magnetStrength={3} scale={1.05} tilt={6}>
              <button
                onClick={scrollToTop}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-[#1E292E] hover:text-[#D96B6B] transition-colors self-start cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            </Magnet>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#899195]">
          <div>
            © {new Date().getFullYear()} DeepSpur Research Team. MIT Open Source License.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Audit Verified
            </span>
            <span>Version 1.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
