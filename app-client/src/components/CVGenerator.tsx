"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CVPreview from "@/components/CVPreview";
import { useSearchParams } from "next/navigation";
import { candidateService } from "@/services/candidateService";
import { getPublicJobOffer, generateCVWithAI } from "@/services/jobOfferService";
import { getCandidateApplications } from "@/services/applicationService";
import type { CandidateProfile, Application } from "@/types/candidate";
import type { JobOffer } from "@/types/jobOffer";
import { Save, Download, ArrowLeft, CheckCircle2 } from "lucide-react";

type CVForm = {
	fullName: string;
	position: string;
	summary: string;
	skills: string;
	experience: string;
	education: string;
	email: string;
	phoneNumber: string;
};

type JobOfferData = {
	jobName?: string;
	jobLevel?: string;
	jobDescription?: string;
	salary?: string;
	requirements?: string;
	responsibilities?: string;
	whatWeOffer?: string;
	companyName?: string;
};

type DataSource = "manual" | "application";

export default function CVGenerator() {
	const searchParams = useSearchParams();
	const [dataSource, setDataSource] = useState<DataSource>("manual");
	const [applications, setApplications] = useState<Application[]>([]);
	const [loadingApplications, setLoadingApplications] = useState(false);
	const [selectedApplicationId, setSelectedApplicationId] = useState<number | undefined>();
	const [form, setForm] = useState<CVForm>({
		fullName: "",
		position: "",
		summary: "",
		skills: "",
		experience: "",
		education: "",
		email: "",
		phoneNumber: "",
	});

	const [jobOfferData, setJobOfferData] = useState<JobOfferData>({});

	const [loading, setLoading] = useState(false);
	const [loadedFromProfile, setLoadedFromProfile] = useState(false);
	const [unauth, setUnauth] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCV, setGeneratedCV] = useState<any>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// refs for auto-resizing fields
	const fullNameRef = useRef<HTMLTextAreaElement | null>(null);
	const positionRef = useRef<HTMLTextAreaElement | null>(null);
	const skillsRef = useRef<HTMLTextAreaElement | null>(null);
	const summaryRef = useRef<HTMLTextAreaElement | null>(null);
	const experienceRef = useRef<HTMLTextAreaElement | null>(null);
	const educationRef = useRef<HTMLTextAreaElement | null>(null);

	function adjustHeight(el: HTMLTextAreaElement | null) {
		if (!el) return;
		el.style.height = "auto";
		// Add a small extra px to avoid scrollbar flicker
		el.style.height = `${el.scrollHeight}px`;
	}

	// Helpers to map backend profile data into simple text fields
	const joinFullName = (p: CandidateProfile) => {
		const parts = [p.name, p.lastName].filter(Boolean);
		if (parts.length === 0 && p.user?.username) return p.user.username;
		return parts.join(" ");
	};

	const formatSkills = (skills: unknown) => {
		if (!Array.isArray(skills) || skills.length === 0) return "";
		const names = skills.map((item) => {
			if (typeof item === "string") return item;
			if (item && typeof item === "object" && "name" in item) {
				return (item as any).name as string;
			}
			return String(item ?? "");
		});
		return names.filter(Boolean).join(", ");
	};

	const formatExperience = (items: unknown) => {
		if (!Array.isArray(items) || items.length === 0) return "";
		const lines = items.map((raw) => {
			const it: any = raw ?? {};
			const position = it.position ?? it.title ?? "";
			const company = it.company ?? "";
			const header = [position, company].filter(Boolean).join(" @ ");
			const start = (it.startDate ?? it.from ?? "").toString();
			const endRaw = it.isCurrent ? "obecnie" : (it.endDate ?? it.to ?? "");
			const end = endRaw ? endRaw.toString() : "";
			const periodStart = start ? start.slice(0, 7) : ""; // YYYY-MM
			const periodEnd = end ? end.slice(0, 7) : (it.isCurrent ? "obecnie" : "");
			const period = [periodStart, periodEnd].filter(Boolean).join(" – ");
			const loc = it.location ? `, ${it.location}` : "";
			const descText = it.description
				? String(it.description)
				: Array.isArray(it.responsibilities) && it.responsibilities.length
				? `\n- ${it.responsibilities.join("\n- ")}`
				: "";
			return `${header}${loc}${period ? ` (${period})` : ""}${descText ? `\n${descText}` : ""}`.trim();
		});
		return lines.filter(Boolean).join("\n\n");
	};

	const formatEducation = (items: unknown) => {
		if (!Array.isArray(items) || items.length === 0) return "";
		const lines = items.map((raw) => {
			const it: any = raw ?? {};
			const institution = it.institution ?? it.school ?? "";
			const degree = it.degree ?? "";
			const field = it.fieldOfStudy ?? it.field ?? "";
			const start = (it.startDate ?? it.from ?? "").toString();
			const endRaw = it.isCurrent ? "obecnie" : (it.endDate ?? it.to ?? "");
			const end = endRaw ? endRaw.toString() : "";
			const periodStart = start ? start.slice(0, 7) : ""; // YYYY-MM
			const periodEnd = end ? end.slice(0, 7) : (it.isCurrent ? "obecnie" : "");
			let period = [periodStart, periodEnd].filter(Boolean).join(" – ");
			if (!period && it.graduationYear) {
				period = String(it.graduationYear);
			}
			const title = [degree, institution].filter(Boolean).join(", ");
			const fieldStr = field ? ` — ${field}` : "";
			const loc = it.location ? `, ${it.location}` : "";
			const desc = it.description ? `\n${it.description}` : "";
			return `${title}${fieldStr}${loc}${period ? ` (${period})` : ""}${desc}`.trim();
		});
		return lines.filter(Boolean).join("\n\n");
	};

	useEffect(() => {
		if (dataSource === "application") {
			loadApplications();
		}
	}, [dataSource]);

	const loadApplications = async () => {
		setLoadingApplications(true);
		setErrorMsg(null);
		try {
			const response = await getCandidateApplications({ limit: 100 });
			// Filtruj tylko aplikacje ze statusem PENDING
			const pendingApps = response.applications.filter(
				app => app.status === 'PENDING'
			);
			setApplications(pendingApps);
			if (pendingApps.length > 0) {
				setSelectedApplicationId(pendingApps[0].id);
			}
		} catch (err: any) {
			console.error("Error loading applications:", err);
			setErrorMsg(err.message || err.response?.data?.message || "Nie udało się załadować aplikacji.");
		} finally {
			setLoadingApplications(false);
		}
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			setErrorMsg(null);
			try {
				// Pobierz ID oferty z query params
				const jobOfferId = searchParams?.get("jobOfferId");

				// Jeśli mamy ID oferty, pobierz dane z API
				if (jobOfferId && mounted) {
					try {
						const jobOffer = await getPublicJobOffer(parseInt(jobOfferId));
						setJobOfferData({
							jobName: jobOffer.name || undefined,
							jobLevel: Array.isArray(jobOffer.jobLevel) ? jobOffer.jobLevel.join(", ") : jobOffer.jobLevel,
							jobDescription: jobOffer.description || undefined,
							salary: jobOffer.salary || undefined,
							requirements: Array.isArray(jobOffer.requirements) ? jobOffer.requirements.join("\n") : jobOffer.requirements,
							responsibilities: Array.isArray(jobOffer.responsibilities) ? jobOffer.responsibilities.join("\n") : jobOffer.responsibilities,
							whatWeOffer: Array.isArray(jobOffer.whatWeOffer) ? jobOffer.whatWeOffer.join("\n") : jobOffer.whatWeOffer,
							companyName: jobOffer.employerProfile?.companyName || undefined,
						});

						// Prefill form with job offer data
						if (mounted) {
							setForm((prev) => {
								const next: CVForm = { ...prev };
								if (jobOffer.name) next.position = jobOffer.name;
								const levelInfo = jobOffer.jobLevel ? (Array.isArray(jobOffer.jobLevel) ? `Poziom: ${jobOffer.jobLevel.join(", ")}` : `Poziom: ${jobOffer.jobLevel}`) : "";
								const salaryInfo = jobOffer.salary ? `Wynagrodzenie: ${jobOffer.salary}` : "";
								if (levelInfo || salaryInfo || jobOffer.description) {
									next.summary = [levelInfo, salaryInfo, jobOffer.description].filter(Boolean).join("\n");
								}
								return next;
							});
						}
					} catch (err: any) {
						console.error("Error fetching job offer:", err);
						setErrorMsg("Nie udało się pobrać danych oferty pracy. Uzupełnij dane ręcznie.");
					}
				}

				// Pobranie profilu kandydata
				const profile = await candidateService.getProfile();
				if (!mounted || !profile) return;

				// Wczytaj dane z profilu, ale nie nadpisuj tego co pochodzi z oferty
				setForm((prev) => {
					const next: CVForm = { ...prev };
					
					// Wczytaj imię/nazwisko jeśli brak
					if (!next.fullName) {
						next.fullName = joinFullName(profile);
					}
					
					// Wczytaj dane kontaktowe
					if (!next.email && profile.user?.email) {
						next.email = profile.user.email;
					}
					if (!next.phoneNumber && profile.phoneNumber) {
						next.phoneNumber = profile.phoneNumber.toString();
					}
					
					// Wczytaj umiejętności, doświadczenie i edukację
					if (!next.skills) next.skills = formatSkills(profile.skills);
					if (!next.experience) next.experience = formatExperience(profile.experience);
					if (!next.education) next.education = formatEducation(profile.education);
					
					// Jeśli nie ma pozycji z oferty, wczytaj z profilu
					if (!jobOfferId && !next.position) {
						next.position = "";
					}
					
					// Jeśli nie ma podsumowania z oferty, wczytaj z profilu
					if (!jobOfferId && !next.summary) {
						next.summary = profile.description || "";
					}
					
					return next;
				});
				setLoadedFromProfile(true);
				
				// after prefill, ensure fields resize to content
				setTimeout(() => {
					adjustHeight(fullNameRef.current);
					adjustHeight(positionRef.current);
					adjustHeight(skillsRef.current);
					adjustHeight(summaryRef.current);
					adjustHeight(experienceRef.current);
					adjustHeight(educationRef.current);
				}, 0);
			} catch (err: any) {
				const status = err?.response?.status;
				if (status === 401) {
					setUnauth(true);
				} else if (status === 404) {
					// profile not found — leave form empty, show gentle note
					setErrorMsg("Nie znaleziono profilu kandydata — uzupełnij dane ręcznie lub w profilu.");
				} else {
					setErrorMsg("Nie udało się pobrać danych profilu. Spróbuj ponownie później.");
				}
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [searchParams]);

	// whenever the form changes, adjust heights so the UI stays in sync
	useEffect(() => {
		adjustHeight(fullNameRef.current);
		adjustHeight(positionRef.current);
		adjustHeight(skillsRef.current);
		adjustHeight(summaryRef.current);
		adjustHeight(experienceRef.current);
		adjustHeight(educationRef.current);
	}, [form.fullName, form.position, form.skills, form.summary, form.experience, form.education]);

	// Load generated CV from sessionStorage on mount
	useEffect(() => {
		const savedCV = sessionStorage.getItem('generatedCV');
		if (savedCV) {
			try {
				const parsedCV = JSON.parse(savedCV);
				setGeneratedCV(parsedCV);
			} catch (error) {
				console.error('Error parsing saved CV:', error);
				sessionStorage.removeItem('generatedCV');
			}
		}
	}, []);

	const handleGenerateCV = async () => {
		try {
			setIsGenerating(true);
			setErrorMsg(null);

			// Jeśli źródłem danych jest aplikacja, pobierz pełne dane oferty
			let jobOfferDataToSend = jobOfferData;
			if (dataSource === "application" && selectedApplicationId) {
				const selectedApp = applications.find(app => app.id === selectedApplicationId);
				if (selectedApp) {
					try {
						const fullJobOffer = await getPublicJobOffer(selectedApp.jobOfferId);
						jobOfferDataToSend = {
							jobName: fullJobOffer.name || undefined,
							jobLevel: Array.isArray(fullJobOffer.jobLevel) ? fullJobOffer.jobLevel.join(", ") : fullJobOffer.jobLevel,
							jobDescription: fullJobOffer.description || undefined,
							salary: fullJobOffer.salary || undefined,
							requirements: Array.isArray(fullJobOffer.requirements) ? fullJobOffer.requirements.join("\n") : fullJobOffer.requirements,
							responsibilities: Array.isArray(fullJobOffer.responsibilities) ? fullJobOffer.responsibilities.join("\n") : fullJobOffer.responsibilities,
							whatWeOffer: Array.isArray(fullJobOffer.whatWeOffer) ? fullJobOffer.whatWeOffer.join("\n") : fullJobOffer.whatWeOffer,
							companyName: fullJobOffer.employerProfile?.companyName || undefined,
						};
					} catch (err) {
						console.error("Error fetching full job offer:", err);
					}
				}
			}

			const cv = await generateCVWithAI({
				fullName: form.fullName,
				position: form.position,
				summary: form.summary,
				skills: form.skills,
				experience: form.experience,
				education: form.education,
				email: form.email,
				phoneNumber: form.phoneNumber,
				jobOffer: Object.keys(jobOfferDataToSend).length > 0 ? jobOfferDataToSend : undefined
			});

			setGeneratedCV(cv);
			// Save to sessionStorage
			sessionStorage.setItem('generatedCV', JSON.stringify(cv));
		} catch (error: any) {
			console.error('Error generating CV:', error);
			setErrorMsg(error.message || 'Nie udało się wygenerować CV');
		} finally {
			setIsGenerating(false);
		}
	};

	// Loading view: show only a centered spinner
	if (isGenerating) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="h-10 w-10 rounded-full border-2 border-gray-300 border-b-transparent animate-spin" />
					<p className="text-sm text-muted-foreground">Generowanie CV...</p>
				</div>
			</div>
		);
	}

	// Success view: show CV preview with download button below
	if (generatedCV) {
		const handleDownloadPDF = async () => {
			try {
				// Dynamiczny import @react-pdf/renderer
				const { pdf } = await import('@react-pdf/renderer');
				const { CVDocument } = await import('./CVDocument');
				
				const fileName = `CV_${(generatedCV.fullName || 'kandydat').replace(/\s+/g, '_')}.pdf`;
				
				// Generuj PDF z komponentu React
				const blob = await pdf(<CVDocument cv={generatedCV} />).toBlob();
				
				// Utwórz link do pobrania
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error('Error generating PDF:', error);
				alert('Nie udało się pobrać PDF. Spróbuj ponownie.');
			}
		};

		const handleGenerateNew = () => {
			setGeneratedCV(null);
			sessionStorage.removeItem('generatedCV');
			setSaveSuccess(false);
		};

		const handleSaveToProfile = async () => {
			if (!generatedCV) return;
			
			try {
				setIsSaving(true);
				setErrorMsg(null);
				
				// Nazwa CV to stanowisko z wygenerowanego CV
				const cvName = generatedCV.position || form.position || 'CV';
				
				await candidateService.saveGeneratedCV(cvName, generatedCV);
				setSaveSuccess(true);
				
				// Opcjonalnie: wyczyść komunikat sukcesu po 3 sekundach
				setTimeout(() => setSaveSuccess(false), 3000);
			} catch (error: any) {
				console.error('Error saving CV to profile:', error);
				const errorMessage = error?.response?.data?.message || error.message || 'Nie udało się zapisać CV na profilu';
				setErrorMsg(errorMessage);
			} finally {
				setIsSaving(false);
			}
		};

		return (
			<div className="space-y-4">
				{/* Komunikat sukcesu */}
				{saveSuccess && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
						<CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
						<p className="text-green-700 font-medium">CV zostało pomyślnie zapisane na Twoim profilu</p>
					</div>
				)}
				
				{/* Komunikat błędu */}
				{errorMsg && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700">{errorMsg}</p>
					</div>
				)}
				
				<CVPreview cv={generatedCV} />
				
				<div className="flex flex-col gap-4 print:hidden">
					{/* Główne akcje */}
					<div className="flex items-center justify-center gap-3">
						<Button variant="outline" onClick={handleGenerateNew} className="gap-2">
							<ArrowLeft className="w-4 h-4" />
							Wygeneruj nowe CV
						</Button>
						<Button onClick={handleDownloadPDF} className="gap-2">
							<Download className="w-4 h-4" />
							Pobierz PDF
						</Button>
					</div>
					
					{/* Sekcja zapisywania na profilu */}
					<div className="border-t pt-4">
						<div className="flex flex-col items-center gap-3">
							<div className="text-center">
								<p className="text-sm font-medium text-gray-700 mb-1">Zapisz CV na swoim profilu</p>
								<p className="text-xs text-muted-foreground">
									Nazwa CV: <span className="font-medium text-gray-900">{generatedCV.position || form.position || 'CV'}</span>
								</p>
							</div>
							<Button 
								variant={saveSuccess ? "outline" : "default"}
								size="lg"
								onClick={handleSaveToProfile}
								disabled={isSaving || saveSuccess}
								className={`gap-2 min-w-[200px] transition-all ${
									saveSuccess 
										? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' 
										: ''
								}`}
							>
								{isSaving ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent" />
										Zapisywanie...
									</>
								) : saveSuccess ? (
									<>
										<CheckCircle2 className="w-5 h-5" />
										Zapisano na profilu
									</>
								) : (
									<>
										<Save className="w-5 h-5" />
										Zapisz na profilu
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{/* Notices */}
			<div className="md:col-span-2 -mb-2">
				{unauth && (
					<div className="mb-4 rounded-lg border bg-white p-4 text-sm">
						<p className="font-medium">Jesteś niezalogowany/a.</p>
						<p className="text-muted-foreground">Aby w pełni wykorzystać możliwości generatora i wczytać dane z profilu, zaloguj się.</p>
					</div>
				)}
				{!unauth && loadedFromProfile && (
					<div className="mb-4 rounded-lg border bg-white p-4 text-sm">
						<p className="font-medium">Wczytano dane z profilu kandydata.</p>
						<p className="text-muted-foreground">Możesz je edytować przed wydrukiem lub zapisem do PDF.</p>
					</div>
				)}
				{!unauth && errorMsg && (
					<div className="mb-4 rounded-lg border bg-white p-4 text-sm">
						<p className="font-medium">Informacja</p>
						<p className="text-muted-foreground">{errorMsg}</p>
					</div>
				)}
			</div>
			
			{/* Wybór źródła danych */}
			<div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
				<h2 className="text-lg font-semibold mb-4">Wybierz źródło danych</h2>
				<div className="flex gap-3">
					<Button
						variant={dataSource === "manual" ? "default" : "outline"}
						onClick={() => setDataSource("manual")}
						className="flex-1"
					>
						Ręczne wprowadzanie
					</Button>
					<Button
						variant={dataSource === "application" ? "default" : "outline"}
						onClick={() => setDataSource("application")}
						className="flex-1"
					>
						Moje aplikacje
					</Button>
				</div>
				
				{/* Lista aplikacji */}
				{dataSource === "application" && (
					<div className="mt-4">
						{loadingApplications ? (
							<div className="text-center py-4">
								<div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-primary animate-spin mx-auto mb-2" />
								<p className="text-sm text-muted-foreground">Ładowanie aplikacji...</p>
							</div>
						) : applications.length === 0 ? (
							<div className="text-center py-4 text-sm text-muted-foreground">
								Brak aplikacji ze statusem "oczekujące". Aplikuj na oferty, aby móc generować CV dla konkretnych stanowisk.
							</div>
						) : (
							<div>
								<label className="text-sm font-medium block mb-2">Wybierz aplikację</label>
								<select
									value={selectedApplicationId || ""}
									onChange={(e) => {
										const id = parseInt(e.target.value);
										setSelectedApplicationId(id);
										// Automatycznie załaduj dane z wybranej aplikacji
										const selectedApp = applications.find(app => app.id === id);
										if (selectedApp) {
											setJobOfferData({
												jobName: selectedApp.jobOffer.name,
												companyName: selectedApp.jobOffer.employerProfile.companyName,
											});
											setForm(prev => ({
												...prev,
												position: selectedApp.jobOffer.name,
											}));
										}
									}}
									className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
								>
									{applications.map((app) => (
										<option key={app.id} value={app.id}>
											{app.jobOffer.name} - {app.jobOffer.employerProfile.companyName}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				)}
			</div>
			
			{/* Form */}
			<div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-2">
				<h2 className="text-lg font-semibold mb-4">Wprowadź dane</h2>
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium">Imię i nazwisko</label>
						<textarea
							ref={fullNameRef}
							rows={1}
							value={form.fullName}
							onChange={(e) => setForm({ ...form, fullName: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Jan Kowalski"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Stanowisko</label>
						<textarea
							ref={positionRef}
							rows={1}
							value={form.position}
							onChange={(e) => setForm({ ...form, position: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Frontend Developer"
						/>
					</div>


					<div>
						<label className="text-sm font-medium">Podsumowanie</label>
						<textarea
							ref={summaryRef}
							rows={3}
							value={form.summary}
							onChange={(e) => setForm({ ...form, summary: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Krótki opis Twojego doświadczenia i celów"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Umiejętności (oddziel przecinkami)</label>
						<textarea
							ref={skillsRef}
							rows={1}
							value={form.skills}
							onChange={(e) => setForm({ ...form, skills: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="React, TypeScript, Next.js, Tailwind"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Doświadczenie</label>
						<textarea
							ref={experienceRef}
							rows={4}
							value={form.experience}
							onChange={(e) => setForm({ ...form, experience: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Rola, firma, zakres obowiązków, osiągnięcia"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Wykształcenie</label>
						<textarea
							ref={educationRef}
							rows={3}
							value={form.education}
							onChange={(e) => setForm({ ...form, education: e.target.value })}
							onInput={(e) => adjustHeight(e.currentTarget)}
							className="mt-1 w-full rounded-md border px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Uczelnia, kierunek, lata"
						/>
					</div>

					{/* Dane oferty pracy - read-only (przeniesione na koniec formularza) */}
					{Object.keys(jobOfferData).length > 0 && (
						<div className="mt-6 pt-6 border-t">
							<h3 className="text-sm font-semibold mb-4 text-gray-700">Dane z oferty pracy</h3>
							<div className="space-y-4 bg-slate-100 p-4 rounded-lg border border-gray-200">
								{jobOfferData.companyName && (
									<div>
										<label className="text-xs font-medium text-gray-600">Pracodawca</label>
										<p className="text-sm text-gray-900 mt-1">{jobOfferData.companyName}</p>
									</div>
								)}
								
								{jobOfferData.jobLevel && (
									<div>
										<label className="text-xs font-medium text-gray-600">Poziom stanowiska</label>
										<p className="text-sm text-gray-900 mt-1">{jobOfferData.jobLevel}</p>
									</div>
								)}
								
								{jobOfferData.salary && (
									<div>
										<label className="text-xs font-medium text-gray-600">Wynagrodzenie</label>
										<p className="text-sm text-gray-900 mt-1">{jobOfferData.salary}</p>
									</div>
								)}
								
								{jobOfferData.responsibilities && (
									<div>
										<label className="text-xs font-medium text-gray-600">Obowiązki</label>
										<p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{jobOfferData.responsibilities}</p>
									</div>
								)}
								
								{jobOfferData.requirements && (
									<div>
										<label className="text-xs font-medium text-gray-600">Wymagania</label>
										<p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{jobOfferData.requirements}</p>
									</div>
								)}
								
								{jobOfferData.whatWeOffer && (
									<div>
										<label className="text-xs font-medium text-gray-600">Co oferujemy</label>
										<p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{jobOfferData.whatWeOffer}</p>
									</div>
								)}
							</div>
							<p className="text-xs text-gray-500 mt-2">Te informacje są pobrane z oferty pracy i nie mogą być edytowane.</p>
						</div>
					)}

					{/* Akcje: Generuj CV */}
					<div className="mt-6 flex justify-center">
						<Button onClick={handleGenerateCV} disabled={isGenerating || !form.fullName || !form.position}>
							{isGenerating ? 'Generowanie CV...' : 'Generuj CV'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

