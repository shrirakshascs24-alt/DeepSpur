"use client";

import React, { useState } from "react";
import { Search, Split, BarChart2, Repeat, ShieldCheck, Rocket, ChevronRight, Check } from "lucide-react";

export default function PipelineSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Discovery",
      subtitle: "Attribution Extraction",
      icon: Search,
      details: "Compute Grad-CAM, Integrated Gradients, and layer-wise relevance maps to locate spatial heat concentrations.",
      metric: "Layer 4 Feature Map",
    },
    {
      num: "02",
      title: "Slicing",
      subtitle: "Subgroup Discovery",
      icon: Split,
      details: "Cluster latent representations to partition data into aligned majority and conflict minority quadrants.",
      metric: "4 Group Partition",
    },
    {
      num: "03",
      title: "Diagnosis",
      subtitle: "Worst-Group Audit",
      icon: BarChart2,
      details: "Evaluate empirical risk gap. Identify brittle subgroups with catastrophic performance drops under correlation shift.",
      metric: "Worst-Group Acc: 42.8%",
    },
    {
      num: "04",
      title: "Counterfactual",
      subtitle: "Domain Swap Test",
      icon: Repeat,
      details: "Stress-test representations by transposing foreground targets onto counterfactual background environments.",
      metric: "Inversion Shift Test",
    },
    {
      num: "05",
      title: "Mitigation",
      subtitle: "Group DRO & JTT",
      icon: ShieldCheck,
      details: "Apply Distributionally Robust Optimization or Deep Feature Reweighting (DFR) to equalize group risks.",
      metric: "Regularized Objective",
    },
    {
      num: "06",
      title: "Deployment",
      subtitle: "Robust Production",
      icon: Rocket,
      details: "Validate invariance bounds and deploy neural network models immune to background shortcut co-occurrences.",
      metric: "Worst Acc Boost: +48%",
      highlight: true,
    },
  ];

  return (
    <section id="pipeline" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
              <span>System Architecture</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
              Connected Pipeline: From Discovery to Mitigation
            </h2>
            <p className="mt-2 text-[#646B6F] text-base leading-relaxed">
              A principled analytical loop to detect spurious features, audit worst-group vulnerabilities, and regularize shortcut reliance.
            </p>
          </div>

          <div className="text-xs font-mono text-[#8C9397] bg-white/60 border border-[#E2DDD2] rounded-lg px-3 py-1.5 self-start md:self-auto">
            <span>6-STAGE CLOSED-LOOP AUDIT</span>
          </div>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 relative flex flex-col justify-between group ${
                  step.highlight
                    ? "real-glass-coral text-white shadow-xl hover:scale-102"
                    : isSelected
                    ? "real-glass-card border-2 border-[#1E292E] shadow-xl -translate-y-1 bg-white/80"
                    : "real-glass-card hover:border-[#D96B6B]/40 hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-xs font-bold ${
                        step.highlight
                          ? "text-white/80"
                          : isSelected
                          ? "text-[#D96B6B]"
                          : "text-[#838A8E]"
                      }`}
                    >
                      {step.num}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        step.highlight
                          ? "text-white"
                          : isSelected
                          ? "text-[#1E292E]"
                          : "text-[#757E83]"
                      }`}
                    />
                  </div>

                  <h3
                    className={`font-editorial text-lg leading-tight font-semibold ${
                      step.highlight
                        ? "text-white"
                        : "text-[#1E292E] group-hover:text-[#D96B6B] transition-colors"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <h4
                    className={`text-[11px] font-mono uppercase tracking-wider mb-2.5 ${
                      step.highlight ? "text-white/85" : "text-[#899195]"
                    }`}
                  >
                    {step.subtitle}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      step.highlight ? "text-white/90" : "text-[#5C6569]"
                    }`}
                  >
                    {step.details}
                  </p>
                </div>

                <div
                  className={`mt-4 pt-3 border-t text-[10px] font-mono flex items-center justify-between ${
                    step.highlight
                      ? "border-white/20 text-white/80"
                      : "border-white/60 text-[#71797D]"
                  }`}
                >
                  <span className="truncate">{step.metric}</span>
                  <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

