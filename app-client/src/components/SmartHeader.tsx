"use client";
import { useAuth } from "@/context/authContext";
import { Header } from "./Header";
import { CandidateHeader } from "./CandidateHeader";
import { EmployerHeader } from "./EmployerHeader";

export function SmartHeader() {
  const { user } = useAuth();

  // Jeśli użytkownik jest zalogowany jako kandydat, użyj CandidateHeader
  if (user && user.role === 'CANDIDATE') {
    return <CandidateHeader />;
  }
  
  // Jeśli użytkownik jest zalogowany jako pracodawca, użyj EmployerHeader
  if (user && user.role === 'EMPLOYER') {
    return <EmployerHeader />;
  }
  
  // Jeśli użytkownik nie jest zalogowany, użyj podstawowego Header
  return <Header />;
}
