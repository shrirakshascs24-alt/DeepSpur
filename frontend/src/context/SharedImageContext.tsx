"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SharedImageState {
  imageType: "dataset" | "custom";
  datasetFilename: string;
  datasetSplit: string;
  specimenId: string;
  customBase64: string | null;
  customFileName: string | null;
  displayUrl: string;
  isHydrated: boolean;
}

const DEFAULT_STATE: SharedImageState = {
  imageType: "dataset",
  datasetFilename: "001.Black_footed_Albatross/Black_Footed_Albatross_0046_18.jpg",
  datasetSplit: "test",
  specimenId: "WB-0001",
  customBase64: null,
  customFileName: null,
  displayUrl: `${API_BASE_URL}/api/dataset/image?filename=001.Black_footed_Albatross%2FBlack_Footed_Albatross_0046_18.jpg`,
  isHydrated: false,
};

interface SharedImageContextType {
  activeImage: SharedImageState;
  setCustomImage: (base64: string, filename: string) => void;
  setDatasetImage: (filename: string, id: string, split?: string) => void;
  resetToDefault: () => void;
}

const SharedImageContext = createContext<SharedImageContextType | undefined>(undefined);

const STORAGE_KEY = "deepspur_shared_active_image";

export function SharedImageProvider({ children }: { children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<SharedImageState>(DEFAULT_STATE);

  // Hydrate from sessionStorage on client mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setActiveImage({
          ...parsed,
          isHydrated: true,
        });
      } else {
        setActiveImage((prev) => ({ ...prev, isHydrated: true }));
      }
    } catch (e) {
      console.warn("Failed to hydrate active image from sessionStorage:", e);
      setActiveImage((prev) => ({ ...prev, isHydrated: true }));
    }

    // Listen for cross-tab or custom sync events
    const handleSync = (e: Event) => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setActiveImage({
            ...JSON.parse(stored),
            isHydrated: true,
          });
        }
      } catch (err) {
        console.warn("Sync error:", err);
      }
    };

    window.addEventListener("deepspur-image-sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("deepspur-image-sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const setCustomImage = (base64: string, filename: string) => {
    const newState: SharedImageState = {
      imageType: "custom",
      datasetFilename: "",
      datasetSplit: "custom",
      specimenId: `CUSTOM: ${filename}`,
      customBase64: base64,
      customFileName: filename,
      displayUrl: base64,
      isHydrated: true,
    };
    setActiveImage(newState);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new Event("deepspur-image-sync"));
    } catch (e) {
      console.warn("Storage quota or error writing active image:", e);
    }
  };

  const setDatasetImage = (filename: string, id: string, split: string = "test") => {
    const newState: SharedImageState = {
      imageType: "dataset",
      datasetFilename: filename,
      datasetSplit: split,
      specimenId: id,
      customBase64: null,
      customFileName: null,
      displayUrl: `${API_BASE_URL}/api/dataset/image?filename=${encodeURIComponent(filename)}`,
      isHydrated: true,
    };
    setActiveImage(newState);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new Event("deepspur-image-sync"));
    } catch (e) {
      console.warn("Storage error writing active image:", e);
    }
  };

  const resetToDefault = () => {
    const newState: SharedImageState = {
      ...DEFAULT_STATE,
      isHydrated: true,
    };
    setActiveImage(newState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("deepspur-image-sync"));
    } catch (e) {
      console.warn("Storage error clearing active image:", e);
    }
  };

  return (
    <SharedImageContext.Provider
      value={{
        activeImage,
        setCustomImage,
        setDatasetImage,
        resetToDefault,
      }}
    >
      {children}
    </SharedImageContext.Provider>
  );
}

export function useSharedImage() {
  const context = useContext(SharedImageContext);
  if (!context) {
    throw new Error("useSharedImage must be used within a SharedImageProvider");
  }
  return context;
}
