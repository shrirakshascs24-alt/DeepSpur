"use client";

import React, { ReactNode } from "react";
import { SharedImageProvider } from "@/context/SharedImageContext";

export function Providers({ children }: { children: ReactNode }) {
  return <SharedImageProvider>{children}</SharedImageProvider>;
}
