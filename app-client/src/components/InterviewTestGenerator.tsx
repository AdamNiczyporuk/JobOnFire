"use client";
import { useState, useEffect } from "react";
import { generateQuestionsWithAI } from "@/services/questionService";
import { getCandidateApplications } from "@/services/applicationService";
import { Application } from "@/types/candidate";

type GenerationMode = "application" | "custom";

export default function InterviewTestGenerator() {
const [mode, setMode] = useState<GenerationMode>("custom");
const [applications, setApplications] = useState<Application[]>([]);
const [loadingApplications, setLoadingApplications] = useState(false);
const [selectedApplicationId, setSelectedApplicationId] = useState<number | undefined>();
const [position, setPosition] = useState("");
const [jobLevel, setJobLevel] = useState("");
const [jobDescription, setJobDescription] = useState("");
const [requirements, setRequirements] = useState("");
const [responsibilities, setResponsibilities] = useState("");
const [count, setCount] = useState(10);
const [questions, setQuestions] = useState<string[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
if (mode === "application") {
loadApplications();
}
}, [mode]);

const loadApplications = async () => {
setLoadingApplications(true);
setError(null);
try {
const response = await getCandidateApplications({ limit: 100 });
const activeApps = response.applications.filter(
app => app.status === 'PENDING' || app.status === 'ACCEPTED'
);
setApplications(activeApps);
if (activeApps.length > 0) {
setSelectedApplicationId(activeApps[0].id);
}
} catch (err: any) {
console.error("Error loading applications:", err);
setError(err.message || err.response?.data?.message || "Nie udało się załadować aplikacji.");
} finally {
setLoadingApplications(false);
}
};

const onGenerate = async () => {
setLoading(true);
setError(null);
setQuestions([]);
try {
let generatedQuestions: string[];
if (mode === "application") {
if (!selectedApplicationId) {
setError("Wybierz aplikację");
setLoading(false);
return;
}
generatedQuestions = await generateQuestionsWithAI({
mode: "application",
applicationId: selectedApplicationId,
count: Math.max(1, Math.min(20, count)),
});
} else {
// Walidacja - wszystkie pola muszą być wypełnione
if (!position.trim()) {
setError("Podaj nazwę stanowiska");
setLoading(false);
return;
}
if (!jobLevel.trim()) {
setError("Wybierz poziom stanowiska");
setLoading(false);
return;
}
if (!jobDescription.trim()) {
setError("Podaj opis stanowiska");
setLoading(false);
return;
}
if (!requirements.trim()) {
setError("Podaj wymagania");
setLoading(false);
return;
}
if (!responsibilities.trim()) {
setError("Podaj obowiązki");
setLoading(false);
return;
}

generatedQuestions = await generateQuestionsWithAI({
mode: "custom",
position: position.trim(),
jobLevel: jobLevel || undefined,
jobDescription: jobDescription.trim() || undefined,
requirements: requirements.trim() || undefined,
responsibilities: responsibilities.trim() || undefined,
count: Math.max(1, Math.min(20, count)),
});
}
setQuestions(generatedQuestions);
} catch (err: any) {
console.error("Error generating questions:", err);
setError(err.message || "Nie udało się wygenerować pytań");
} finally {
setLoading(false);
}
};

const onClear = () => {
setQuestions([]);
setError(null);
if (mode === "custom") {
setPosition("");
setJobLevel("");
setJobDescription("");
setRequirements("");
setResponsibilities("");
}
setCount(10);
};

const selectedApplication = applications.find(app => app.id === selectedApplicationId);

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Wygeneruj pytania (wspomagane AI)</h2>
				<div className="mb-4">
					<label className="text-sm font-medium block mb-2">Tryb generowania</label>
					<div className="flex gap-2">
						<button onClick={() => setMode("custom")} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "custom" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
							Własne dane
						</button>
						<button onClick={() => setMode("application")} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "application" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
							Pytania pod moją aplikację
						</button>
					</div>
				</div>
				{mode === "application" ? (
					<div className="space-y-4">
						{loadingApplications ? (
							<div className="text-sm text-muted-foreground">Ładowanie aplikacji...</div>
						) : applications.length === 0 ? (
							<div className="text-sm text-muted-foreground">Nie masz żadnych aktywnych aplikacji. Aplikuj na oferty pracy, aby móc generować pytania dla swoich aplikacji.</div>
						) : (
							<div className="flex flex-col">
								<label className="text-sm font-medium block mb-1">Wybierz aplikację</label>
								<select value={selectedApplicationId} onChange={(e) => setSelectedApplicationId(Number(e.target.value))} className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
									{applications.map((app) => (
										<option key={app.id} value={app.id}>
											{app.jobOffer?.name || "Oferta"} - {app.jobOffer?.employerProfile?.companyName || "Firma"}
										</option>
									))}
								</select>
								{selectedApplication && (
									<div className="mt-2 text-xs text-muted-foreground">
										<p><strong>Status:</strong> {selectedApplication.status === 'PENDING' ? 'Oczekująca' : selectedApplication.status === 'ACCEPTED' ? 'Zaakceptowana' : selectedApplication.status === 'REJECTED' ? 'Odrzucona' : 'Anulowana'}</p>
									</div>
								)}
							</div>
						)}
					</div>
				) : (
						<div className="space-y-4">
							<div className="flex flex-col">
								<label htmlFor="it-position" className="text-sm font-medium block mb-1">Stanowisko *</label>
								<input id="it-position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="np. Frontend Developer, Backend Engineer" className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
							</div>
							<div className="flex flex-col">
								<label htmlFor="it-jobLevel" className="text-sm font-medium block mb-1">Poziom *</label>
								<select id="it-jobLevel" value={jobLevel} onChange={(e) => setJobLevel(e.target.value)} className="w-full sm:w-48 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
								<option value="">Wybierz poziom</option>
								<option value="junior">Junior</option>
								<option value="mid">Mid</option>
								<option value="senior">Senior</option>
							</select>
						</div>
						<div className="flex flex-col">
							<label htmlFor="it-description" className="text-sm font-medium block mb-1">Opis stanowiska *</label>
							<textarea id="it-description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Krótki opis stanowiska..." rows={2} className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
						</div>
						<div className="flex flex-col">
							<label htmlFor="it-requirements" className="text-sm font-medium block mb-1">Wymagania *</label>
							<textarea id="it-requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="np. React, TypeScript, REST API..." rows={2} className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
						</div>
						<div className="flex flex-col">
							<label htmlFor="it-responsibilities" className="text-sm font-medium block mb-1">Obowiązki *</label>
							<textarea id="it-responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="np. Tworzenie nowych funkcjonalności, code review..." rows={2} className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
						</div>
					</div>
				)}
				<div className="mt-4 flex flex-col">
					<label className="text-sm font-medium block mb-1">Liczba pytań</label>
					<select value={String(count)} onChange={(e) => setCount(Number(e.target.value))} className="w-full sm:w-32 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40">
						{Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (<option key={n} value={n}>{n}</option>))}
					</select>
				</div>
				{error && (
					<div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3">
						<p className="text-sm text-red-800">{error}</p>
					</div>
				)}
				<div className="mt-6 flex items-center gap-3">
					<button onClick={onGenerate} className="rounded-full bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90 disabled:opacity-60" disabled={loading || (mode === "application" && !selectedApplicationId)}>
						{loading ? "Generuję..." : questions.length > 0 ? "Generuj ponownie" : "Generuj pytania"}
					</button>
					<button onClick={onClear} className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50">
						Wyczyść
					</button>
				</div>
			</div>
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<div className="mb-4">
					<h2 className="text-lg font-semibold">Wygenerowane pytania</h2>
					{questions.length > 0 && (<p className="text-xs text-muted-foreground mt-1">Liczba pytań: {questions.length}</p>)}
				</div>
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-muted-foreground">Generowanie pytań za pomocą AI...</div>
					</div>
				) : questions.length === 0 ? (
					<div className="text-sm text-muted-foreground">
						Brak wygenerowanych pytań. {mode === "application" ? "Wybierz aplikację" : "Wpisz stanowisko"} i naciśnij „Generuj pytania".
					</div>
				) : (
					<ol className="list-decimal pl-5 space-y-3">
						{questions.map((q, i) => (<li key={i} className="text-sm leading-relaxed">{q}</li>))}
					</ol>
				)}
			</div>
		</div>
	);
}
