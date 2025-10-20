"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api";

export default function CVUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => router.push("/candidate/login"), 1500);
      return () => clearTimeout(timer);
    } else if (user.role !== "CANDIDATE") {
      const timer = setTimeout(() => router.push("/"), 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Walidacja typu pliku
      if (droppedFile.type !== "application/pdf") {
        setError("Tylko pliki PDF są akceptowane!");
        return;
      }
      
      // Walidacja rozmiaru (5MB)
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("Plik jest za duży! Maksymalny rozmiar to 5MB.");
        return;
      }

      setFile(droppedFile);
      if (!name) {
        setName(droppedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Walidacja typu pliku
      if (selectedFile.type !== "application/pdf") {
        setError("Tylko pliki PDF są akceptowane!");
        return;
      }
      
      // Walidacja rozmiaru (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Plik jest za duży! Maksymalny rozmiar to 5MB.");
        return;
      }

      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Wybierz plik PDF!");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('name', name || file.name.replace('.pdf', ''));

      const response = await api.post('/candidate/cvs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('CV zostało pomyślnie przesłane! ✅');
        router.push('/candidate/cvs');
      }
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      const errorMessage = error.response?.data?.message || 'Nie udało się przesłać CV. Spróbuj ponownie.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Sprawdzanie uprawnień...</p>
      </main>
    );
  }

  if (user.role !== "CANDIDATE") {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-red-600">Brak dostępu</p>
      </main>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Nagłówek */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Dodaj CV 📄
        </h1>
        <p className="text-muted-foreground">
          Prześlij swoje CV w formacie PDF
        </p>
      </div>

      {/* Formularz */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="cv-file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            
            {file ? (
              <div className="space-y-2">
                <p className="font-semibold text-primary">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-500"
                >
                  Usuń plik
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Przeciągnij i upuść plik PDF tutaj
                </p>
                <p className="text-sm text-muted-foreground">lub</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cv-file')?.click()}
                >
                  Wybierz plik
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Maksymalny rozmiar: 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nazwa CV */}
        <div className="space-y-2">
          <Label htmlFor="cv-name">Nazwa CV (opcjonalnie)</Label>
          <Input
            id="cv-name"
            type="text"
            placeholder="np. CV Junior Developer"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Jeśli nie podasz nazwy, użyjemy nazwy pliku
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Przyciski */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/candidate/cvs')}
            disabled={uploading}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={!file || uploading} className="flex-1">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Przesyłanie...
              </>
            ) : (
              'Prześlij CV'
            )}
          </Button>
        </div>
      </form>

      {/* Informacja */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Wskazówka</h4>
            <p className="text-sm text-blue-800">
              Przesłane CV będzie bezpiecznie przechowywane w chmurze i będziesz
              mógł/mogła je pobrać w dowolnym momencie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
