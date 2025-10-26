"use client";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ochrona przed uruchomieniem w środowisku SSR / build step
    if (typeof window === 'undefined') return;
    try {
      const consent = window.localStorage.getItem("cookie_consent");
      if (!consent) {
        setVisible(true);
        document.body.style.overflow = "hidden";
      }
    } catch (e) {
      // Jeżeli storage jest niedostępny (tryb prywatny / blokada) – ignorujemy.
      console.warn("CookieConsent: localStorage not available", e);
    }
  }, []);

  const acceptCookies = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("cookie_consent", "accepted");
      }
    } catch (e) {
      console.warn("CookieConsent: cannot persist consent", e);
    }
    setVisible(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = "";
    }
  };

  // Prevent hydration mismatch by not rendering until mounted on client
  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
        <h2 className="text-lg font-bold mb-2">Zgoda na cookies</h2>
        <p className="mb-4 text-justify">Ta strona korzysta z plików cookies w celu zapewnienia prawidłowego działania i analityki. Aby kontynuować musisz wyrazić zgodę.</p>
        <button
          onClick={acceptCookies}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
        >
          Akceptuję
        </button>
      </div>
    </div>
  );
}
