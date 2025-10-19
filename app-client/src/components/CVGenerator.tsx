"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CVPreview from "@/components/CVPreview";
import { useSearchParams } from "next/navigation";
import { candidateService } from "@/services/candidateService";
import { getPublicJobOffer, generateCVWithAI } from "@/services/jobOfferService";
import type { CandidateProfile } from "@/types/candidate";
import type { JobOffer } from "@/types/jobOffer";

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

export default function CVGenerator() {
	const searchParams = useSearchParams();
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

			const cv = await generateCVWithAI({
				fullName: form.fullName,
				position: form.position,
				summary: form.summary,
				skills: form.skills,
				experience: form.experience,
				education: form.education,
				email: form.email,
				phoneNumber: form.phoneNumber,
				jobOffer: Object.keys(jobOfferData).length > 0 ? jobOfferData : undefined
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
			const element = document.getElementById('cv-print');
			if (!element) return;

			try {
				const html2pdf = (await import('html2pdf.js')).default;
				const fileName = `CV_${(generatedCV.fullName || 'kandydat').replace(/\s+/g, '_')}.pdf`;
				
				const opt = {
					margin: [8, 10, 8, 10] as [number, number, number, number],
					filename: fileName,
					image: { type: 'jpeg' as const, quality: 0.95 },
					html2canvas: { 
						scale: 2,
						useCORS: true,
						letterRendering: true,
						backgroundColor: '#ffffff',
						logging: false,
						windowWidth: 794,
						windowHeight: 1123
					},
					jsPDF: { 
						unit: 'mm', 
						format: 'a4', 
						orientation: 'portrait' as const,
						compress: true
					},
					pagebreak: { 
						mode: ['avoid-all', 'css', 'legacy'],
						avoid: ['section', 'header', 'div']
					}
				};

				await html2pdf().set(opt).from(element).save();
			} catch (error) {
				console.error('Error generating PDF:', error);
				alert('Nie udało się pobrać PDF. Spróbuj ponownie.');
			}
		};

		const handleGenerateNew = () => {
			setGeneratedCV(null);
			sessionStorage.removeItem('generatedCV');
		};

		return (
			<div className="space-y-4">
				<CVPreview cv={generatedCV} />
				<div className="flex items-center justify-center gap-3 print:hidden">
					<Button variant="outline" onClick={handleGenerateNew}>
						← Wygeneruj nowe CV
					</Button>
					<Button onClick={handleDownloadPDF}>Pobierz CV</Button>
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

