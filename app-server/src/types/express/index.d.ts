import { UserRole, employerProfile, candidateProfile } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: UserRole;
      employerProfile?: employerProfile | null;
      candidateProfile?: candidateProfile | null;
    }
  }
}