"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Magnet from "./Magnet";
import { Sparkles, ArrowRight, Layers, Database, ShieldAlert, Cpu, ExternalLink, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E6E0D4] py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#25333A] to-[#3B4E57] flex items-center justify-center shadow-sm relative overflow-hidden group">
            <div className="w-3.5 h-3.5 rounded bg-[#D96B6B] transform rotate-45 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg tracking-wider font-semibold text-[#1E292E] uppercase">
              DeepSpur
            </span>
            <span className="text-[9px] tracking-widest text-[#8A8A85] uppercase -mt-1 font-mono">
              Research Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#5F6568]">
          <button
            onClick={() => scrollTo("causality")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => scrollTo("pipeline")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollTo("ecosystem")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Ecosystem
          </button>
          <button
            onClick={() => scrollTo("waterbirds")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Waterbirds
          </button>
          <button
            onClick={() => scrollTo("explainability")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Explainability
          </button>
          <button
            onClick={() => scrollTo("discrepancy")}
            className="hover:text-[#1E292E] transition-colors"
          >
            Benchmarks
          </button>
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Magnet padding={40} magnetStrength={3} scale={1.03} tilt={4}>
            <button
              onClick={() => scrollTo("explainability")}
              className="text-[12px] font-mono tracking-wider text-[#5F6568] hover:text-[#1E292E] px-3 py-1.5 transition-colors cursor-pointer"
            >
              DOCS & SPECS
            </button>
          </Magnet>
          <Magnet padding={50} magnetStrength={2.5} scale={1.04} tilt={8}>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white bg-[#1E292E] hover:bg-[#28383F] shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Magnet>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 text-[#2B353A] rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF9F5]/98 backdrop-blur-xl border-b border-[#E6E0D4] px-6 py-4 flex flex-col gap-3 shadow-lg">
          <button
            onClick={() => scrollTo("causality")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Overview
          </button>
          <button
            onClick={() => scrollTo("pipeline")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollTo("ecosystem")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Ecosystem
          </button>
          <button
            onClick={() => scrollTo("waterbirds")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Waterbirds Benchmark
          </button>
          <button
            onClick={() => scrollTo("explainability")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Explainability & XAI
          </button>
          <button
            onClick={() => scrollTo("discrepancy")}
            className="text-left py-2 text-sm text-[#384347] font-medium"
          >
            Accuracy Discrepancy
          </button>
          <button
            onClick={() => scrollTo("diagnostic-preview")}
            className="mt-2 w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#D96B6B] flex items-center justify-center gap-2"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </nav>
  );
}

