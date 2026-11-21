"use client";

import React from "react";
import { Eye, ShieldX, Network, CheckCircle, AlertTriangle, Cpu } from "lucide-react";

export default function CausalitySection() {
  const cards = [
    {
      num: "01",
      title: "Semantic Learning",
      subtitle: "Morphological Invariants",
      icon: Eye,
      description:
        "The model identifies true causal signatures — bill curvature, plumage feather patterns, and anatomical proportions. These core semantic features remain invariant across novel backgrounds and lighting conditions.",
      metricLabel: "Invariant Weight",
      metricValue: "78.4%",
      isAlert: false,
      tag: "Ideal Generalization",
    },
    {
      num: "02",
      title: "Background Confounding",
      subtitle: "Spurious Shortcut Traps",
      icon: ShieldX,
      description:
        "The neural network bypasses the bird completely, mapping water surface ripples directly to 'waterbird' and forest canopy foliage to 'landbird' because these statistical co-occurrences offer lower training loss.",
      metricLabel: "Shortcut Reliance",
      metricValue: "64.8%",
      isAlert: true,
      tag: "Catastrophic Failure Mode",
    },
    {
      num: "03",
      title: "Representational Entanglement",
      subtitle: "Coupled Latent Tokens",
      icon: Network,
      description:
        "In intermediate convolutional layers, background texture tokens irreversibly merge into object embeddings. Simple linear classification heads cannot separate the bird from its background without specialized reweighting.",
      metricLabel: "Coupling Degree",
      metricValue: "0.82 I(Z;C)",
      isAlert: false,
      tag: "Latent Manifold Drift",
    },
  ];

  return (
    <section id="causality" className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>The Causality Problem</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            What does your deep learning model{" "}
            <span className="italic font-normal text-[#D96B6B]">really</span> see?
          </h2>
          <p className="mt-3 text-[#646B6F] text-base leading-relaxed">
            Supervised models maximize mutual information with training labels — taking the easiest path to empirical risk minimization. When spurious cues co-occur with semantic classes, the network relies on the background as a shortcut.
          </p>
        </div>

        {/* 3 Morphism Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className={`real-glass-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group ${
                  card.isAlert ? "border-t-[#F0A8A8] bg-[#FFF8F7]/70" : ""
                }`}
              >
                {/* Accent top specular highlight */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    card.isAlert
                      ? "bg-gradient-to-r from-[#D96B6B] to-[#C85656]"
                      : "bg-gradient-to-r from-white via-white/80 to-transparent"
                  }`}
                />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold shadow-sm ${
                        card.isAlert
                          ? "bg-[#D96B6B] text-white"
                          : "bg-[#25333A] text-white"
                      }`}
                    >
                      {card.num}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full real-glass-subcard ${
                        card.isAlert
                          ? "text-[#C45252] font-semibold border border-[#F5CCCC]"
                          : "text-[#636B6F]"
                      }`}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl text-[#1E292E] mb-1 font-semibold group-hover:text-[#D96B6B] transition-colors">
                    {card.title}
                  </h3>
                  <h4 className="text-xs font-mono text-[#8C9397] uppercase tracking-wider mb-3">
                    {card.subtitle}
                  </h4>
                  <p className="text-sm text-[#5C6569] leading-relaxed mb-6 font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/60 flex items-center justify-between">
                  <span className="text-xs text-[#788084] font-mono">{card.metricLabel}</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      card.isAlert ? "text-[#D96B6B]" : "text-[#243136]"
                    }`}
                  >
                    {card.metricValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

