import { Button } from "@/components/ui/button";

export function GoogleAuthButton({ label = "Zaloguj się z Google", role }: { label?: string; role: "CANDIDATE" | "EMPLOYER" }) {
  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Poprawka: przekazujemy role jako query param 'role', nie 'state'
    const url = `${apiUrl}/api/v1/auth/google?role=${role}`;
    window.location.href = url;
  };

  return (
    <Button
      type="button"
      className="w-full flex items-center justify-center gap-2 bg-white border text-black hover:bg-gray-100"
      onClick={handleGoogleLogin}
    >
      <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-18h-21v-9z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.7 16.1 19.5 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/><path fill="#FBBC05" d="M24 45c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.2 36.7 26.7 37.5 24 37.5c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C6.6 41.1 14.7 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C6.6 41.1 14.7 45 24 45c10.5 0 19.5-7.6 21-18h-21v-9z"/></g></svg>
      {label}
    </Button>
  );
}
