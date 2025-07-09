"use client";
import type { ReactNode } from "react";
import { CandidateHeader } from "@/components/CandidateHeader";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <CandidateHeader />
      {children}
    </div>
  );
}
