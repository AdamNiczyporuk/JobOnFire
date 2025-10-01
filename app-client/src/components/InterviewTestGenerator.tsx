"use client";
import { useMemo, useState } from "react";

const QUESTION_BANK: Record<string, string[]> = {
	"Ogólne": [
		"Opowiedz o projekcie, z którego jesteś dumny/a. Jaka była Twoja rola?",
		"Jak podchodzisz do code review?",
		"Jak planujesz rozwój swojej kariery w najbliższych 2 latach?",
	],
	"Frontend": [
		"Czym różni się SSR od SSG w Next.js i kiedy którego użyć?",
		"Wyjaśnij mechanizm reconciliacji w React.",
		"Jak zoptymalizował(a)byś wydajność dużej aplikacji React?",
	],
	"TypeScript": [
		"Co to jest union i intersection type?",
		"Wyjaśnij różnicę między type a interface.",
		"Jak napisać generyczną funkcję z ograniczeniami (extends)?",
	],
	"CSS": [
		"Różnice między Grid a Flexbox — przykłady zastosowań.",
		"Jak wdrożyć ciemny motyw i dbać o dostępność?",
		"Co to są zmienne CSS i jak ich używasz?",
	],
};

export default function InterviewTestGenerator() {
	const categories = Object.keys(QUESTION_BANK);
	const [selected, setSelected] = useState<string[]>([categories[0]]);
	const [count, setCount] = useState(6);

	const questions = useMemo(() => {
		const pool = selected.flatMap((c) => QUESTION_BANK[c] || []);
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, Math.max(1, Math.min(count, pool.length)));
	}, [selected, count]);

	const toggle = (c: string) => {
		setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
	};

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Wybierz kategorie pytań</h2>
				<div className="flex flex-wrap gap-2 mb-6">
					{categories.map((c) => (
						<button
							key={c}
							onClick={() => toggle(c)}
							className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
								selected.includes(c)
									? "bg-primary text-white border-primary hover:bg-primary/90"
									: "bg-white hover:bg-gray-50"
							}`}
						>
							{c}
						</button>
					))}
				</div>

				<label className="text-sm font-medium">Liczba pytań</label>
				<input
					type="number"
					min={1}
					max={20}
					value={count}
					onChange={(e) => setCount(Number(e.target.value))}
					className="mt-1 w-32 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
				/>
			</div>

			<div className="rounded-xl border bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Wylosowane pytania</h2>
					<button
						className="rounded-full bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90"
						onClick={() => {
							// trigger re-render by toggling selection
							setSelected((prev) => [...prev]);
						}}
					>
						Wylosuj ponownie
					</button>
				</div>
				<ol className="list-decimal pl-5 space-y-3">
					{questions.map((q, i) => (
						<li key={i} className="text-sm leading-relaxed">
							{q}
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}

