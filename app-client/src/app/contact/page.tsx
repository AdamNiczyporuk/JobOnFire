export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Kontakt</h1>
      <p className="mb-2">Formularz kontaktowy będzie tu dodany.</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>Email: support@example.com</li>
        <li>Telefon: +48 600 000 000</li>
      </ul>
    </main>
  );
}
