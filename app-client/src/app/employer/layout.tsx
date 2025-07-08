"use client";
import type { ReactNode } from "react";
import { EmployerHeader } from "@/components/EmployerHeader";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <EmployerHeader />
      {children}
    </div>
  );
}
