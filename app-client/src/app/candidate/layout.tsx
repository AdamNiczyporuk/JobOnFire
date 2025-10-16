"use client";
import type { ReactNode } from "react";
import { SharedHeader } from "@/components/SharedHeader";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <SharedHeader />
      <div className="w-full flex-1">
        {children}
      </div>
    </div>
  );
}
