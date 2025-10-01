"use client";
import { useState } from "react";

const BASE_QUESTIONS: string[] = [
	"Opowiedz o projekcie, z którego jesteś dumny/a. Jaka była Twoja rola?",
	"Jak podchodzisz do code review?",
	"Jak planujesz rozwój swojej kariery w najbliższych 2 latach?",
];

const ROLE_TEMPLATES: Record<string, string[]> = {
	default: [
		"Jakie są Twoje najważniejsze obowiązki na stanowisku {role}?",
		"Jakie wyzwania techniczne napotkałeś/aś na stanowisku {role} i jak je rozwiązałeś/aś?",
		"Opisz sytuację, w której musiałeś/aś współpracować z innym działem (np. backend, product) — jak to przebiegało?",
	],
	frontend: [
		"Jak zaprojektował(a)byś strukturę komponentów dla nowego widoku w aplikacji React dla {role}?",
		"Jak byś zoptymalizował(a) czas ładowania strony i interaktywną wydajność?",
		"Jak podchodzisz do testów frontendowych (jednostkowe/integracyjne/e2e)?",
	],
	backend: [
		"Jak zaprojektował(a)byś API do paginacji dużego zestawu danych?",
		"Opowiedz o podejściu do skalowania serwisu backendowego pod rosnące obciążenie.",
		"Jak zapewniasz bezpieczeństwo i autoryzację w swoich usługach?",
	],
};

const LEVEL_PROMPTS: Record<string, string> = {
	junior: "(pytania dostosowane do poziomu Junior — skup się na podstawach i nauce)",
	mid: "(pytania dla Mid — oczekuje się doświadczenia praktycznego i samodzielności)",
	senior: "(pytania dla Senior — architektura, podejmowanie decyzji i mentoring)",
};

function pickRoleTemplates(role: string) {
	const r = role.toLowerCase();
	if (r.includes("front")) return ROLE_TEMPLATES.frontend;
	if (r.includes("back")) return ROLE_TEMPLATES.backend;
	return ROLE_TEMPLATES.default;
}

function generateQuestions(role: string, level: string, count: number): string[] {
	const templates = pickRoleTemplates(role);
	const levelNote = LEVEL_PROMPTS[level.toLowerCase() as keyof typeof LEVEL_PROMPTS] || "";
	const results: string[] = [];

	// start with some base behavioural questions
	for (const q of BASE_QUESTIONS) {
		if (results.length >= count) break;
		results.push(`${q} ${levelNote}`.trim());
	}

	let i = 0;
	while (results.length < count) {
		const tpl = templates[i % templates.length];
		const text = tpl.replace(/{role}/g, role || "stanowisko");
		results.push(`${text} ${levelNote}`.trim());
		i++;
	}

	// final pass: ensure unique and limit
	return Array.from(new Set(results)).slice(0, count);
}

export default function InterviewTestGenerator() {
	const [role, setRole] = useState("Frontend Developer");
	const [level, setLevel] = useState("mid");
	const [count, setCount] = useState(6);
	const [questions, setQuestions] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const onGenerate = async () => {
		setLoading(true);
		try {
			// Here you would call a real AI endpoint. For now we generate locally based on templates.
			const qs = generateQuestions(role, level, Math.max(1, Math.min(20, count)));
			// small fake delay to mimic network/AI latency
			await new Promise((r) => setTimeout(r, 350));
			setQuestions(qs);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Wygeneruj pytania (wspomagane AI)</h2>

								<div className="mt-2 flex flex-col">
									<label className="text-sm font-medium block">Stanowisko</label>
									<input
								value={role}
								onChange={(e) => setRole(e.target.value)}
								placeholder="np. Frontend Developer, Backend Engineer"
								className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
							/>
						</div>

								<div className="mt-4 flex flex-col">
									<label className="text-sm font-medium block">Poziom</label>
									<select
										value={level}
										onChange={(e) => setLevel(e.target.value)}
										className="mt-1 w-full sm:w-48 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
									>
								<option value="junior">Junior</option>
								<option value="mid">Mid</option>
								<option value="senior">Senior</option>
							</select>
						</div>

								<div className="mt-4 flex flex-col">
									<label className="text-sm font-medium block">Liczba pytań</label>
									<select
										value={String(count)}
										onChange={(e) => setCount(Number(e.target.value))}
										className="mt-1 w-full sm:w-32 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
									>
								{Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
									<option key={n} value={n}>{n}</option>
								))}
							</select>
						</div>

				<div className="mt-6 flex items-center gap-3">
					<button
						onClick={onGenerate}
						className="rounded-full bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90 disabled:opacity-60"
						disabled={loading}
					>
						{loading ? "Generuję..." : questions.length > 0 ? "Generuj ponownie" : "Generuj pytania"}
					</button>

					<button
						onClick={() => {
							setRole("");
							setLevel("mid");
							setCount(6);
							setQuestions([]);
						}}
						className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
					>
						Wyczyść
					</button>
				</div>
			</div>

			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<div className="mb-4">
					<h2 className="text-lg font-semibold">Wygenerowane pytania</h2>
				</div>

				{questions.length === 0 ? (
					<div className="text-sm text-muted-foreground">Brak wygenerowanych pytań. Wpisz stanowisko i naciśnij „Generuj pytania”.</div>
				) : (
					<ol className="list-decimal pl-5 space-y-3">
						{questions.map((q, i) => (
							<li key={i} className="text-sm leading-relaxed">
								{q}
							</li>
						))}
					</ol>
				)}
			</div>
		</div>
	);
}

