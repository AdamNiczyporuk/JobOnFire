import Link from "next/link";

export default function ToolSidebar() {
	return (
		<aside className="w-full md:w-72 shrink-0">
			<nav className="grid grid-cols-2 md:grid-cols-1 gap-4">
				<Link
					href="/tools"
					className="group block rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
				>
					<div className="flex items-center gap-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
						</div>
						<div>
							<p className="font-semibold leading-tight">Przygotowania do rozmowy</p>
							<p className="text-xs text-muted-foreground">Porady i checklisty</p>
						</div>
					</div>
				</Link>

				<Link
					href="/tools/salary-calculator"
					className="group block rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
				>
					<div className="flex items-center gap-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
								<line x1="7" y1="7" x2="7" y2="7" />
								<line x1="11" y1="7" x2="11" y2="7" />
								<line x1="15" y1="7" x2="15" y2="7" />
								<line x1="7" y1="11" x2="7" y2="11" />
								<line x1="11" y1="11" x2="11" y2="11" />
								<line x1="15" y1="11" x2="15" y2="11" />
								<rect x="6" y="15" width="12" height="4" />
							</svg>
						</div>
						<div>
							<p className="font-semibold leading-tight">Kalkulator wynagrodzeń</p>
							<p className="text-xs text-muted-foreground">Brutto ↔ Netto, koszt pracodawcy</p>
						</div>
					</div>
				</Link>

				<Link
					href="/tools/cv-generator"
					className="group block rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-5 w-5"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<path d="M14 2v6h6" />
									<path d="M16 13H8" />
									<path d="M16 17H8" />
									<path d="M10 9H8" />
								</svg>
							</div>
							<div>
								<p className="font-semibold leading-tight">Generator CV</p>
								<p className="text-xs text-muted-foreground">Szybko przygotuj estetyczne CV</p>
							</div>
						</div>
						{/* AI badge */}
						<span className="ml-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M12 2v4" />
								<path d="M12 18v4" />
								<path d="M4.93 4.93l2.83 2.83" />
								<path d="M16.24 16.24l2.83 2.83" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							<span>AI</span>
						</span>
					</div>
				</Link>

				<Link
					href="/tools/questions"
					className="group block rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
				>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-5 w-5"
								>
									<circle cx="12" cy="12" r="10" />
									<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
									<path d="M12 17h.01" />
								</svg>
								</div>
							<div>
								<p className="font-semibold leading-tight">Pytania na rozmowę</p>
								<p className="text-xs text-muted-foreground">Zestawy najczęstszych pytań</p>
							</div>
						</div>
						<span className="ml-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M12 2v4" />
								<path d="M12 18v4" />
								<path d="M4.93 4.93l2.83 2.83" />
								<path d="M16.24 16.24l2.83 2.83" />
								<circle cx="12" cy="12" r="3" />
							</svg>
							<span>AI</span>
						</span>
					</div>
				</Link>
			</nav>
		</aside>
	);
}

