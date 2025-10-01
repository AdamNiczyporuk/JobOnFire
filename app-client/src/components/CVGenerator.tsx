"use client";
import { useEffect, useState } from "react";
import { candidateService } from "@/services/candidateService";
import type { CandidateProfile, Education, Experience, Skill } from "@/types/candidate";

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

	// Helpers to map backend profile data into simple text fields
	const joinFullName = (p: CandidateProfile) => {
		const parts = [p.name, p.lastName].filter(Boolean);
		if (parts.length === 0 && p.user?.username) return p.user.username;
		return parts.join(" ");
	};

	const formatSkills = (skills: Skill[] | undefined) => {
		if (!skills || skills.length === 0) return "";
		return skills.map((s) => s.name).join(", ");
	};

	const formatExperience = (items: Experience[] | undefined) => {
		if (!items || items.length === 0) return "";
		const lines = items.map((it) => {
			const periodStart = it.startDate?.slice(0, 7) ?? ""; // YYYY-MM
			const periodEnd = it.isCurrent ? "obecnie" : (it.endDate?.slice(0, 7) ?? "");
			const header = [it.position, it.company].filter(Boolean).join(" @ ");
			const period = [periodStart, periodEnd].filter(Boolean).join(" – ");
			const loc = it.location ? `, ${it.location}` : "";
			const desc = it.description ? `\n${it.description}` : "";
			return `${header}${loc}${period ? ` (${period})` : ""}${desc}`;
		});
		return lines.join("\n\n");
	};

	const formatEducation = (items: Education[] | undefined) => {
		if (!items || items.length === 0) return "";
		const lines = items.map((it) => {
			const inst = [it.degree, it.institution].filter(Boolean).join(", ");
			const field = it.fieldOfStudy ? ` — ${it.fieldOfStudy}` : "";
			const periodStart = it.startDate?.slice(0, 7) ?? "";
			const periodEnd = it.isCurrent ? "obecnie" : (it.endDate?.slice(0, 7) ?? "");
			const period = [periodStart, periodEnd].filter(Boolean).join(" – ");
			const loc = it.location ? `, ${it.location}` : "";
			const desc = it.description ? `\n${it.description}` : "";
			return `${inst}${field}${loc}${period ? ` (${period})` : ""}${desc}`;
		});
		return lines.join("\n\n");
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
						<input
							value={form.fullName}
							onChange={(e) => setForm({ ...form, fullName: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Jan Kowalski"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Stanowisko</label>
						<input
							value={form.position}
							onChange={(e) => setForm({ ...form, position: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Frontend Developer"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Podsumowanie</label>
						<textarea
							value={form.summary}
							onChange={(e) => setForm({ ...form, summary: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Krótki opis Twojego doświadczenia i celów"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Umiejętności (oddziel przecinkami)</label>
						<input
							value={form.skills}
							onChange={(e) => setForm({ ...form, skills: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="React, TypeScript, Next.js, Tailwind"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Doświadczenie</label>
						<textarea
							value={form.experience}
							onChange={(e) => setForm({ ...form, experience: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-primary/40"
							placeholder="Rola, firma, zakres obowiązków, osiągnięcia"
						/>
					</div>
					<div>
						<label className="text-sm font-medium">Wykształcenie</label>
						<textarea
							value={form.education}
							onChange={(e) => setForm({ ...form, education: e.target.value })}
							className="mt-1 w-full rounded-md border px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-primary/40"
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

