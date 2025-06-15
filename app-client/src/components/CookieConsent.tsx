"use client";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    document.body.style.overflow = "";
  };

  if (!visible) return null;

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
