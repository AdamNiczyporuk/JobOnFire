"use client";
import { SmartHeader } from "@/components/SmartHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ContactPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Symulacja wysyłki (tutaj będzie prawdziwy endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        title: "Wiadomość wysłana!",
        description: "Dziękujemy za kontakt. Odpowiemy wkrótce.",
        type: "success",
        duration: 5000
      });
      
      // Resetuj formularz
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      addToast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
        type: "error",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      
      <main className="flex-1 w-full">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Skontaktuj się z nami
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Masz pytania? Chętnie odpowiemy! Wypełnij formularz lub skorzystaj z naszych danych kontaktowych.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formularz kontaktowy */}
            <div className="bg-white rounded-lg border p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-6">Wyślij wiadomość</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Imię i nazwisko</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Jan Kowalski"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="jan.kowalski@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Temat</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Temat wiadomości"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Wiadomość</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Twoja wiadomość..."
                    rows={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </form>
            </div>

            {/* Informacje kontaktowe */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-8 shadow-md">
                <h2 className="text-2xl font-bold mb-6">Dane kontaktowe</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:kontakt@jobonfire.pl" className="text-muted-foreground hover:text-primary">
                        kontakt@jobonfire.pl
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <a href="tel:+48123456789" className="text-muted-foreground hover:text-primary">
                        +48 123 456 789
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Adres</p>
                      <p className="text-muted-foreground">
                        ul. Przykładowa 123<br />
                        00-001 Warszawa
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Godziny otwarcia</p>
                    <div className="text-muted-foreground space-y-1 mt-2">
                      <p>Poniedziałek - Piątek: 9:00 - 17:00</p>
                      <p>Weekend: Nieczynne</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-8 shadow-md">
                <h3 className="font-medium mb-4">Śledź nas</h3>
                <div className="flex gap-4">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
