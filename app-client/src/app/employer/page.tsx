"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/employer/login");
    } else if (user.role === "EMPLOYER") {
      router.replace("/employer/dashboard");
    } else {
      router.replace("/");
    }
  }, [user, router]);

  return <>{children}</>;
}
