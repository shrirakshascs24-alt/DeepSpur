"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSharedImage } from "@/context/SharedImageContext";
import { 
  UploadCloud, RotateCcw, Eye, Layers, ShieldAlert, Sparkles, Check
} from "lucide-react";

export function ActiveSpecimenBanner() {
  const { activeImage, setCustomImage, resetToDefault } = useSharedImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setCustomImage(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="real-glass-board rounded-2xl p-4 border border-white/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Hidden file input for global replacement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Left: Specimen identity & preview */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-[#EFECE4] border border-[#EAE3D5] shrink-0 shadow-xs">
          {activeImage.displayUrl ? (
            <img
              src={activeImage.displayUrl}
              alt="Active Workbench Specimen"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8C9397]">
              No Image
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A8287]">
              SHARED WORKBENCH SPECIMEN
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
              activeImage.imageType === "custom"
                ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                : "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20"
            }`}>
              {activeImage.imageType === "custom" ? "Custom Upload (Active)" : "Benchmark Specimen"}
            </span>
          </div>

          <div className="font-editorial text-base font-bold text-[#1E292E] truncate max-w-md">
            {activeImage.specimenId}
          </div>

          <p className="text-[11px] font-mono text-[#8C9397]">
            Synchronized across Image Analysis, Grad-CAM Studio, and Shortcut Detection.
          </p>
        </div>
      </div>

      {/* Right: Quick Actions & Connected Workflow Navigation */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs font-mono">
        {/* Upload replacement */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white text-[#1E292E] border border-white/90 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#D96B6B]" />
          <span>Upload Image</span>
        </button>

        {/* Reset button if custom */}
        {activeImage.imageType === "custom" && (
          <button
            onClick={resetToDefault}
            className="px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#5F6568] transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to default benchmark specimen"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7A8287]" />
            <span>Reset Default</span>
          </button>
        )}

        {/* Quick Cross-Page Navigation Pills */}
        <div className="flex items-center bg-[#EAE4D7]/70 p-1 rounded-xl border border-black/5 text-[11px]">
          <Link
            href="/image-analysis"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              pathname === "/image-analysis"
                ? "bg-[#25333A] text-white font-bold"
                : "text-[#5F6568] hover:text-[#1E292E]"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Analysis</span>
          </Link>
          <Link
            href="/grad-cam"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              pathname === "/grad-cam"
                ? "bg-[#D96B6B] text-white font-bold"
                : "text-[#5F6568] hover:text-[#1E292E]"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Grad-CAM</span>
          </Link>
          <Link
            href="/shortcut-detection"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              pathname === "/shortcut-detection"
                ? "bg-[#25333A] text-white font-bold"
                : "text-[#5F6568] hover:text-[#1E292E]"
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Shortcut Lab</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
