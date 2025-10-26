"use client";
import { useAuth } from "@/context/authContext";
import { SharedHeader } from "./SharedHeader";
import { EmployerHeader } from "./EmployerHeader";
import { memo } from "react";

function SmartHeaderComponent() {
  const { user } = useAuth();

  // Jeśli użytkownik jest zalogowany jako pracodawca, użyj EmployerHeader
  if (user && user.role === 'EMPLOYER') {
    return <EmployerHeader />;
  }
  
  // Dla kandydatów i niezalogowanych użyj SharedHeader
  return <SharedHeader />;
}

export const SmartHeader = memo(SmartHeaderComponent);
