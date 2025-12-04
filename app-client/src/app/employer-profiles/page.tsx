"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SmartHeader } from "@/components/SmartHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicJobOffers } from "@/services/jobOfferService";
import { JobOffer } from "@/types/jobOffer";
import { Building2, Sparkles, Search } from "lucide-react";

const OFFERS_PAGE_LIMIT = 24;

type EmployerCardData = {
	id: number;
	companyName: string;
	companyImageUrl?: string;
	description?: string;
	industry: string[];
	workingModes: string[];
	benefits: string[];
	jobCount: number;
};

type EmployerAggregation = {
	id: number;
	companyName: string;
	companyImageUrl?: string;
	description?: string;
	industrySet: Set<string>;
	jobCount: number;
	workingModesSet: Set<string>;
	benefitsSet: Set<string>;
};

const truncate = (text?: string, maxLength = 220) => {
	if (!text) return undefined;
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

// Removed location formatting as locations are no longer displayed on this page

// Color helpers for badges
const workingModeBadgeClasses = (mode: string): string => {
	const m = mode.toLowerCase();
	if (m.includes("zdal")) return "bg-primary/10 text-primary"; // Zdalna -> brand red theme
	if (m.includes("hybryd")) return "bg-green-100 text-green-800"; // Hybrydowa -> green
	if (m.includes("stacj") || m.includes("biur") || m.includes("on-site")) return "bg-blue-100 text-blue-800"; // Stacjonarna -> blue
	return "bg-primary/10 text-primary";
};

// Removed contract type badge classes as contract types are no longer displayed

export default function EmployerProfilesPage() {
	const [employers, setEmployers] = useState<EmployerCardData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOption, setSortOption] = useState<"relevance" | "alphabetical">("relevance");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

	const fetchEmployerProfiles = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const employerMap = new Map<number, EmployerAggregation>();
			let currentPage = 1;
			let totalPages = 1;

			while (currentPage <= totalPages) {
				const response = await getPublicJobOffers({ page: currentPage, limit: OFFERS_PAGE_LIMIT });
				totalPages = response.pagination.totalPages;

				response.jobOffers.forEach((offer) => {
					const profile = offer.employerProfile;
					if (!profile) return;

					const existing = employerMap.get(profile.id);
					const entry: EmployerAggregation = existing ?? {
						id: profile.id,
						companyName: profile.companyName,
						companyImageUrl: profile.companyImageUrl,
						description: profile.description || truncate(offer.description),
						industrySet: new Set(profile.industry ?? []),
						jobCount: 0,
						workingModesSet: new Set<string>(),
						benefitsSet: new Set<string>(),
					};

					entry.jobCount += 1;

					if (!entry.companyImageUrl && profile.companyImageUrl) {
						entry.companyImageUrl = profile.companyImageUrl;
					}

					profile.industry?.forEach((industry) => entry.industrySet.add(industry));

					if (!entry.description && (profile.description || offer.description)) {
						entry.description = profile.description || truncate(offer.description);
					}

					offer.workingMode?.forEach((mode) => entry.workingModesSet.add(mode));
					offer.whatWeOffer?.forEach((benefit) => entry.benefitsSet.add(benefit));

					employerMap.set(profile.id, entry);
				});

				if (response.jobOffers.length === 0) {
					break;
				}

				currentPage += 1;
			}

			const aggregatedEmployers = Array.from(employerMap.values())
				.map<EmployerCardData>((entry) => ({
					id: entry.id,
					companyName: entry.companyName,
					companyImageUrl: entry.companyImageUrl,
					description: entry.description,
					industry: Array.from(entry.industrySet).sort((a, b) => a.localeCompare(b)),
					workingModes: Array.from(entry.workingModesSet).sort((a, b) => a.localeCompare(b)),
					benefits: Array.from(entry.benefitsSet).sort((a, b) => a.localeCompare(b)),
					jobCount: entry.jobCount,
				}))
				.sort((a, b) => b.jobCount - a.jobCount || a.companyName.localeCompare(b.companyName));

			setEmployers(aggregatedEmployers);
		} catch (err) {
			console.error("Error fetching employer profiles:", err);
			setError("Nie udało się pobrać profili pracodawców.");
			setEmployers([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchEmployerProfiles();
	}, [fetchEmployerProfiles]);

	// Resetuj stronę przy zmianie filtrów/sortowania
	useEffect(() => {
		setPage(1);
	}, [searchTerm, sortOption]);

	const filteredEmployers = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		let data = !query
			? employers
			: employers.filter((employer) => {
					const haystack = [
						employer.companyName,
						employer.description ?? "",
						...employer.industry,
						...employer.workingModes,
						...employer.benefits,
					]
						.join(" ")
						.toLowerCase();

					return haystack.includes(query);
				});

		if (sortOption === "alphabetical") {
			data = [...data].sort((a, b) => a.companyName.localeCompare(b.companyName));
		} else {
			data = [...data].sort((a, b) => b.jobCount - a.jobCount || a.companyName.localeCompare(b.companyName));
		}

		return data;
	}, [employers, searchTerm, sortOption]);

	const renderDescription = (description?: string) => {
		return truncate(description, 260) ?? "Opis firmy wkrótce dostępny.";
	};

// Removed locations renderer as locations are no longer displayed

	return (
		<div className="flex min-h-screen flex-col">
			<SmartHeader />

			<main className="flex-1 w-full bg-background">
				<div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
					<section className="text-center mb-12">
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
							Poznaj naszych pracodawców
						</h1>
						<p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
							Zobacz profile firm współpracujących z JobOnFire i sprawdź, jakie możliwości czekają na kandydatów.
						</p>

						<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
							<div className="relative w-full sm:max-w-md">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Szukaj po nazwie firmy, branży lub technologii"
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2 justify-center">
								<Button
									type="button"
									size="sm"
									variant={sortOption === "relevance" ? "default" : "outline"}
									onClick={() => setSortOption("relevance")}
								>
									Najpopularniejsze
								</Button>
								<Button
									type="button"
									size="sm"
									variant={sortOption === "alphabetical" ? "default" : "outline"}
									onClick={() => setSortOption("alphabetical")}
								>
									Alfabetycznie
								</Button>
							</div>
						</div>

						<div className="mt-6 text-sm text-muted-foreground">
							{loading ? (
								<span>Ładujemy dane o pracodawcach…</span>
							) : (
								<span>
									Znaleziono <span className="text-red-600 font-semibold">{filteredEmployers.length}</span> firm
								</span>
							)}
						</div>
					</section>

					{loading ? (
						<div className="flex justify-center items-center py-24">
							<div className="text-center">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
								<p className="text-muted-foreground">Chwilka cierpliwości — pobieramy profile firm.</p>
							</div>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
							<p className="text-red-500 text-lg font-medium">{error}</p>
							<Button onClick={fetchEmployerProfiles}>Spróbuj ponownie</Button>
						</div>
					) : filteredEmployers.length === 0 ? (
						<div className="py-24 text-center">
							<h2 className="text-2xl font-semibold mb-2">Nie znaleziono firm</h2>
							<p className="text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania lub wróć później.</p>
						</div>
					) : (
						<div className="space-y-6">
							{filteredEmployers
								.slice((page - 1) * itemsPerPage, page * itemsPerPage)
								.map((employer) => (
								<Link key={employer.id} href={`/companies/${employer.id}`} className="block">
								<Card className="relative flex h-full flex-col shadow-md hover:bg-accent/30 transition-colors">
									<CardHeader className="pb-3">
										<div className="flex items-start gap-4">
																						<CompanyLogo src={employer.companyImageUrl} alt={employer.companyName} />
											<div className="flex-1">
												<CardTitle className="text-2xl font-semibold leading-tight">
													{employer.companyName}
												</CardTitle>
												<CardDescription className="mt-1 text-sm">
													{renderDescription(employer.description)}
												</CardDescription>

												{employer.industry.length > 0 && (
													<div className="mt-3 flex flex-wrap gap-2">
														{employer.industry.map((industry, idx) => (
															<Badge
																key={`${industry}-${idx}`}
																variant="secondary"
																className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
															>
																<Building2 className="mr-1 h-3 w-3" />
																{industry}
															</Badge>
														))}
													</div>
												)}
											</div>
										</div>
									</CardHeader>

									<CardContent className="flex flex-1 flex-col gap-4 pt-0">
										<div className="space-y-4">
											{/* Removed locations and contract types sections */}

											{employer.workingModes.length > 0 && (
												<div>
													<p className="text-sm font-semibold text-foreground">Model pracy</p>
													<div className="mt-2 flex flex-wrap gap-2">
														{employer.workingModes.map((mode, idx) => (
															<Badge
																key={`${mode}-${idx}`}
																variant="secondary"
																className={`text-xs ${workingModeBadgeClasses(mode)} border-0`}
															>
																{mode}
															</Badge>
														))}
													</div>
												</div>
											)}
										</div>

										{employer.benefits.length > 0 && (
											<div className="border-t pt-4">
												<p className="text-sm font-semibold text-foreground">Benefity dla pracowników</p>
												<div className="mt-2 flex flex-wrap gap-2">
													{employer.benefits.slice(0, 6).map((benefit, idx) => (
														<Badge
															key={`${benefit}-${idx}`}
															variant="secondary"
															className="text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100"
														>
															<Sparkles className="mr-1 h-3 w-3" />
															{benefit}
														</Badge>
													))}
													{employer.benefits.length > 6 && (
														<Badge variant="outline" className="text-xs text-muted-foreground">
															+{employer.benefits.length - 6} więcej
														</Badge>
													)}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
								</Link>
							))}
							{/* Paginacja */}
							{filteredEmployers.length > itemsPerPage && (
								<div className="flex justify-center items-center gap-2 mt-8">
									<Button
										variant="outline"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										Poprzednia
									</Button>

									<div className="flex gap-2">
										{Array.from({ length: Math.ceil(filteredEmployers.length / itemsPerPage) }).slice(
											Math.max(0, page - 3),
											Math.max(0, page - 3) + 5
										).map((_, i) => {
											const totalPages = Math.ceil(filteredEmployers.length / itemsPerPage);
											const base = Math.min(Math.max(1, page - 2), Math.max(1, totalPages - 4));
											const pageNum = base + i;
											if (pageNum < 1 || pageNum > totalPages) return null;
											return (
												<Button
													key={pageNum}
													variant={page === pageNum ? "default" : "outline"}
													onClick={() => setPage(pageNum)}
													className="w-10"
												>
													{pageNum}
												</Button>
											);
										})}
									</div>

									<Button
										variant="outline"
										onClick={() => setPage((p) => Math.min(Math.ceil(filteredEmployers.length / itemsPerPage), p + 1))}
										disabled={page === Math.ceil(filteredEmployers.length / itemsPerPage)}
									>
										Następna
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

function CompanyLogo({ src, alt }: { src?: string; alt: string }) {
	const [failed, setFailed] = useState(false);
	return (
		<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
			{src && !failed ? (
				<img
					src={src}
					alt={alt}
					className="h-full w-full object-cover"
					loading="lazy"
					referrerPolicy="no-referrer"
					onError={() => setFailed(true)}
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center">
					<Building2 className="h-8 w-8 text-muted-foreground" />
				</div>
			)}
		</div>
	);
}
