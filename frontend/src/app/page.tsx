"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CausalitySection from "@/components/CausalitySection";
import PipelineSection from "@/components/PipelineSection";
import EcosystemSection from "@/components/EcosystemSection";
import ContextGridSection from "@/components/ContextGridSection";
import ExplainabilityDarkSection from "@/components/ExplainabilityDarkSection";
import CounterfactualSection from "@/components/CounterfactualSection";
import DiscrepancySection from "@/components/DiscrepancySection";
import ManifestoSection from "@/components/ManifestoSection";
import SpecsSection from "@/components/SpecsSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1E2022] font-sans antialiased selection:bg-[#D96B6B]/20 selection:text-[#B84E4E] relative overflow-hidden">
      
      {/* =========================================================================
          GLOBAL AMBIENT LIGHTING & DEPTH MESH (Gives the glass real color to refract!)
          ========================================================================= */}
      
      {/* Ambient background depth elements across the page */}
      <div className="ambient-orb-coral w-[600px] h-[600px] top-[1200px] -left-32 opacity-40 pointer-events-none" />
      <div className="ambient-orb-amber w-[550px] h-[550px] top-[1800px] -right-32 opacity-45 pointer-events-none" />
      <div className="ambient-orb-slate w-[500px] h-[500px] top-[2600px] left-[15%] opacity-35 pointer-events-none" />
      <div className="ambient-orb-coral w-[580px] h-[580px] top-[3400px] right-[10%] opacity-40 pointer-events-none" />
      <div className="ambient-orb-cyan w-[500px] h-[500px] top-[4200px] left-[8%] opacity-35 pointer-events-none" />
      <div className="ambient-orb-coral w-[600px] h-[600px] top-[5000px] right-[20%] opacity-45 pointer-events-none" />

      {/* Subtle architectural depth elements in the background */}
      <div className="absolute top-[1400px] right-[8%] w-64 h-[420px] rounded-3xl bg-gradient-to-b from-[#EAE0D2] to-[#DCD0C0] opacity-30 -rotate-3 blur-[2px] pointer-events-none -z-10" />
      <div className="absolute top-[2900px] left-[6%] w-72 h-[380px] rounded-3xl bg-gradient-to-tr from-[#D96B6B]/15 via-[#E6D7C8] to-[#DDD0C2] opacity-35 rotate-4 blur-[2px] pointer-events-none -z-10" />

      {/* Sticky Navigation Bar */}
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section with Live Morphism Showcase */}
        <HeroSection />

        {/* Section 2: What does your deep learning model really see? */}
        <CausalitySection />

        {/* Section 3: Connected Pipeline: From Discovery to Mitigation */}
        <PipelineSection />

        {/* Section 4: The DeepSpur Research Ecosystem */}
        <EcosystemSection />

        {/* Section 5: One Dataset, Four Distorted Contexts (Waterbirds Grid) */}
        <ContextGridSection />

        {/* Section 6: Dark Hero: See What Your Model Really Sees (Layer CAM) */}
        <ExplainabilityDarkSection />

        {/* Section 7: What happens when the background changes? (Counterfactual Swap) */}
        <CounterfactualSection />

        {/* Section 8: Measure Beyond Overall Accuracy (Interactive Epoch Trajectory) */}
        <DiscrepancySection />

        {/* Section 9: Manifesto Dark Callout Banner */}
        <ManifestoSection />

        {/* Section 10: Engineered for Deep Inspection */}
        <SpecsSection />

        {/* Section 11: Call to Action */}
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
