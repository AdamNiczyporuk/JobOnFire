"use client";
import { useEffect, useRef, useState } from "react";
import { candidateService } from "@/services/candidateService";
import type { CandidateProfile } from "@/types/candidate";

type CVForm = {
	fullName: string;
	position: string;
	summary: string;
	skills: string;
	experience: string;
	education: string;
};

export default function CVGenerator() {
	const [form, setForm] = useState<CVForm>({
		fullName: "",
		position: "",
		summary: "",
		skills: "",
		experience: "",
		education: "",
	});

	const [loading, setLoading] = useState(false);
	const [loadedFromProfile, setLoadedFromProfile] = useState(false);
	const [unauth, setUnauth] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
				const profile = await candidateService.getProfile();
				if (!mounted || !profile) return;

				// Only prefill if the fields are still empty to not override user edits
				setForm((prev) => {
					if (
						prev.fullName || prev.position || prev.summary || prev.skills || prev.experience || prev.education
					) {
						return prev;
					}
					const next: CVForm = {
						fullName: joinFullName(profile),
						position: "",
						summary: profile.description || "",
						skills: formatSkills(profile.skills),
						experience: formatExperience(profile.experience),
						education: formatEducation(profile.education),
					};
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
	}, []);

	// whenever the form changes, adjust heights so the UI stays in sync
	useEffect(() => {
		adjustHeight(fullNameRef.current);
		adjustHeight(positionRef.current);
		adjustHeight(skillsRef.current);
		adjustHeight(summaryRef.current);
		adjustHeight(experienceRef.current);
		adjustHeight(educationRef.current);
	}, [form.fullName, form.position, form.skills, form.summary, form.experience, form.education]);

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
			<div className="rounded-xl border bg-white p-6 shadow-sm">
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
				</div>
			</div>

			{/* Preview */}
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Podgląd CV</h2>
					<button
						className="rounded-full bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90"
						onClick={() => window.print()}
					>
						Drukuj / Zapisz PDF
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<h3 className="text-2xl font-bold">{form.fullName || "Twoje Imię i Nazwisko"}</h3>
						<p className="text-muted-foreground">{form.position || "Stanowisko"}</p>
					</div>

					{form.summary && (
						<section>
							<h4 className="font-semibold mb-1">Podsumowanie</h4>
							<p className="text-sm leading-relaxed whitespace-pre-line">{form.summary}</p>
						</section>
					)}

					{form.skills && (
						<section>
							<h4 className="font-semibold mb-1">Umiejętności</h4>
							<div className="flex flex-wrap gap-2">
								{form.skills.split(",").map((s) => (
									<span key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">
										{s.trim()}
									</span>
								))}
							</div>
						</section>
					)}

					{form.experience && (
						<section>
							<h4 className="font-semibold mb-1">Doświadczenie</h4>
							<p className="text-sm whitespace-pre-line leading-relaxed">{form.experience}</p>
						</section>
					)}

					{form.education && (
						<section>
							<h4 className="font-semibold mb-1">Wykształcenie</h4>
							<p className="text-sm whitespace-pre-line leading-relaxed">{form.education}</p>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}

