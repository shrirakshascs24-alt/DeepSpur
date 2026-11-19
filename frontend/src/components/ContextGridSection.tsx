"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle, Info, ChevronRight, Layers, Sliders } from "lucide-react";

export default function ContextGridSection() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<number | null>(null);

  const quadrants = [
    {
      id: 0,
      title: "Landbird on Land",
      subtitle: "Majority Aligned",
      image: "/images/land_land.jpg",
      species: "Yellow Warbler (Dendroica petechia)",
      background: "Bamboo & Deciduous Forest (Places365)",
      y: 0,
      c: 0,
      samples: "3,498 images",
      ratio: "73.0% of Landbirds",
      accuracy: "96.8%",
      status: "aligned",
      analysis:
        "Standard ERM achieves near-perfect accuracy because target plumage features and leafy forest backgrounds provide overlapping, redundant signals to the classifier.",
    },
    {
      id: 1,
      title: "Landbird on Water",
      subtitle: "Minority Conflict",
      image: "/images/land_water.jpg",
      species: "Groove-billed Ani (Crotophaga sulcirostris)",
      background: "Waterbody & Open Ocean (Places365)",
      y: 0,
      c: 1,
      samples: "184 images",
      ratio: "3.8% of Landbirds",
      accuracy: "42.8%",
      status: "conflict",
      analysis:
        "Catastrophic failure mode. The model ignores bird anatomy and predicts 'Waterbird' simply due to surrounding water reflections and wave textures.",
    },
    {
      id: 2,
      title: "Waterbird on Land",
      subtitle: "Minority Conflict",
      image: "/images/water_land.jpg",
      species: "California Gull (Larus californicus)",
      background: "Broadleaf Forest & Shrubland",
      y: 1,
      c: 0,
      samples: "56 images",
      ratio: "5.0% of Waterbirds",
      accuracy: "48.3%",
      status: "conflict",
      analysis:
        "Extremely sparse slice in standard training sets. Forest background triggers high activation for landbird class, overpowering the gull's webbed feet and bill features.",
    },
    {
      id: 3,
      title: "Waterbird on Water",
      subtitle: "Majority Aligned",
      image: "/images/water_water.jpg",
      species: "California Gull (Larus californicus)",
      background: "Coastline & Lake Surface",
      y: 1,
      c: 1,
      samples: "1,057 images",
      ratio: "95.0% of Waterbirds",
      accuracy: "95.2%",
      status: "aligned",
      analysis:
        "Model leverages strong background shortcuts with zero penalty during standard empirical risk training, creating the illusion of high general intelligence.",
    },
  ];

  return (
    <section id="waterbirds" className="py-20 relative border-t border-[#EAE3D5]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DD] border border-[#DDD3C4] text-[#786E64] font-mono text-[11px] font-medium uppercase tracking-wider mb-3.5">
            <span>The Waterbirds Benchmark</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[44px] text-[#1E292E] leading-tight">
            One Dataset, Four Distorted Contexts
          </h2>
          <p className="mt-3 text-[#646B6F] text-base leading-relaxed">
            Synthesized from CUB-200-2011 and Places365, the 95% biased Waterbirds split unmasks brittle neural reliance. While aligned groups score above 95%, counterfactual minority cells drop by more than half.
          </p>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quadrants.map((quad) => {
            const isConflict = quad.status === "conflict";
            const isSelected = selectedQuadrant === quad.id;

            return (
              <div
                key={quad.id}
                onClick={() => setSelectedQuadrant(isSelected ? null : quad.id)}
                className={`cursor-pointer real-glass-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? "ring-2 ring-[#D96B6B] shadow-2xl -translate-y-1 bg-white/85"
                    : isConflict
                    ? "border-t-[#F09C9C] hover:shadow-xl hover:-translate-y-0.5"
                    : "hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                    <Image
                      src={quad.image}
                      alt={quad.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-medium backdrop-blur-md ${
                          isConflict
                            ? "bg-[#D96B6B]/90 text-white"
                            : "bg-white/80 text-[#25333A]"
                        }`}
                      >
                        {quad.subtitle}
                      </span>
                      <span className="text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
                        y={quad.y}, c={quad.c}
                      </span>
                    </div>

                    {/* Bottom Image Label */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h4 className="font-editorial text-lg leading-tight font-bold drop-shadow-sm">
                        {quad.title}
                      </h4>
                      <p className="text-[11px] text-white/80 font-mono truncate">
                        {quad.species}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#71797D] font-mono">Test Accuracy</span>
                      <span
                        className={`font-mono text-base font-bold ${
                          isConflict ? "text-[#D96B6B]" : "text-emerald-700"
                        }`}
                      >
                        {quad.accuracy}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#EDE8DE] rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${
                          isConflict ? "bg-[#D96B6B]" : "bg-emerald-600"
                        }`}
                        style={{ width: quad.accuracy }}
                      />
                    </div>

                    <p className="text-xs text-[#616B70] leading-relaxed">
                      {quad.analysis}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="p-4 pt-2 border-t border-[#EDE7DB] flex items-center justify-between text-[11px] font-mono text-[#788186]">
                  <span>{quad.samples}</span>
                  <span className={isConflict ? "text-[#C45252] font-semibold" : ""}>
                    {isConflict ? "Severe Drop" : "Baseline"}
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

