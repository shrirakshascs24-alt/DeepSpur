"use client";

import React from "react";
import { Database, ShieldCheck, Cpu, Code2, Layers, CheckCircle2 } from "lucide-react";

export default function SpecsSection() {
  const specs = [
    {
      title: "Diagnostic Benchmarks",
      subtitle: "Multi-Domain Shift Suites",
      dark: true,
      items: [
        "Waterbirds-95 (CUB-200 × Places365)",
        "CelebA Blond/Gender Correlation",
        "MetaShift Context Distributions",
        "ImageNet-9 Spurious Backgrounds",
        "CivilComments-WILDS Bias Slices",
      ],
      tag: "Supported Datasets",
    },
    {
      title: "Mitigation Algorithms",
      subtitle: "Invariant Optimization",
      dark: false,
      items: [
        "Group DRO (Distributionally Robust Opt)",
        "Just Train Twice (JTT Two-Stage)",
        "Deep Feature Reweighting (DFR)",
        "Balanced Subsampling & Upweighting",
        "Invariant Risk Minimization (IRM)",
      ],
      tag: "Correction Frameworks",
      highlight: true,
    },
    {
      title: "Explainability Engine",
      subtitle: "Saliency & Tensor Maps",
      dark: true,
      items: [
        "High-Resolution Grad-CAM & Grad-CAM++",
        "Layer-wise Relevance Propagation",
        "Integrated Gradients Path Attribution",
        "Bounding Box Mask Overlap (IoU/Energy)",
        "Mutual Information Feature Probing",
      ],
      tag: "Attribution Algorithms",
    },
  ];

  return (
    <section className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>Framework Capabilities</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            Engineered for Deep Inspection
          </h2>
          <p className="mt-3 text-[#646B6F] text-sm sm:text-base leading-relaxed">
            Full compatibility with PyTorch, Torchvision, and Hugging Face architectures. Auditing tools plug seamlessly into your existing training loops.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specs.map((spec, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                spec.dark
                  ? "morphism-dark text-white border border-white/10 shadow-xl"
                  : "morphism-card border border-[#E6E0D4] shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      spec.dark
                        ? "bg-white/10 text-cyan-200 border border-white/15"
                        : "bg-[#FDEAEA] text-[#C45252] border border-[#F5CCCC]"
                    }`}
                  >
                    {spec.tag}
                  </span>
                </div>

                <h3
                  className={`font-editorial text-2xl font-bold mb-1 ${
                    spec.dark ? "text-white" : "text-[#1E292E]"
                  }`}
                >
                  {spec.title}
                </h3>
                <h4
                  className={`text-xs font-mono uppercase tracking-wider mb-5 ${
                    spec.dark ? "text-slate-400" : "text-[#838A8E]"
                  }`}
                >
                  {spec.subtitle}
                </h4>

                <ul className="space-y-3">
                  {spec.items.map((item, i) => (
                    <li
                      key={i}
                      className={`text-xs flex items-center gap-2.5 ${
                        spec.dark ? "text-slate-300" : "text-[#555E62]"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          spec.dark ? "text-cyan-400" : "text-[#D96B6B]"
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`mt-6 pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                  spec.dark
                    ? "border-white/10 text-slate-400"
                    : "border-[#EDE7DB] text-[#7A8287]"
                }`}
              >
                <span>Automated Pipeline</span>
                <span className={spec.dark ? "text-cyan-300" : "text-[#D96B6B]"}>
                  v1.4 Core
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

