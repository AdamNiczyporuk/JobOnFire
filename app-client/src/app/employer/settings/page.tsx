"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePassword, deleteAccount, logout } from "@/services/authService";

export default function EmployerSettingsPage() {
  const router = useRouter();
  const { user, isLoading, setUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "EMPLOYER")) {
      router.push("/employer/login");
    }
  }, [user, isLoading, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!newPassword) {
      setError("Wprowadź nowe hasło");
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword: currentPassword || undefined, newPassword });
      setMessage("Hasło zostało zmienione");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Nie udało się zmienić hasła");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setMessage(null);
    setDeleting(true);
    try {
      await deleteAccount();
      setUser(null);
      await logout().catch(() => {});
      router.push("/employer/register");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Nie udało się usunąć konta");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Ustawienia konta</h1>

      {/* Zmiana hasła */}
      <section className="rounded-lg border bg-white p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-1">Zmień hasło</h2>
        <p className="text-sm text-muted-foreground mb-6">Zadbaj o bezpieczeństwo swojego konta.</p>

        {user && user.hasPassword === false ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Twoje konto jest połączone z zewnętrznym providorem (np. Google). Hasło nie jest ustawione i nie można go zmienić tutaj.</p>
            <p className="text-sm">Aby zarządzać dostępem, skorzystaj z ustawień konta Google lub utwórz hasło przez dedykowany flow (jeśli będzie dostępny).</p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktualne hasło</label>
              <Input
                type="password"
                placeholder="Wpisz aktualne hasło"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nowe hasło</label>
              <Input
                type="password"
                placeholder="Wpisz nowe hasło"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className="rounded-md bg-green-50 p-3 border border-green-200">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? "Zapisywanie..." : "Zapisz nowe hasło"}
            </Button>
          </form>
        )}
      </section>

      {/* Usunięcie konta */}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Usuń konto</h2>
        <p className="text-sm text-muted-foreground mb-4">Ta akcja jest nieodwracalna. Spowoduje dezaktywację Twojego konta.</p>
        {!confirmOpen ? (
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Usuń konto
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm">Na pewno chcesz usunąć konto?</span>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "Usuwanie..." : "Tak, usuń"}
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>Anuluj</Button>
          </div>
        )}
      </section>
    </main>
  );
}
