"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SmartHeader } from "@/components/SmartHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicJobOffers } from "@/services/jobOfferService";
import type { JobOffer } from "@/types/jobOffer";
import { Building2, MapPin, ArrowLeft, Sparkles } from "lucide-react";

export default function CompanyPublicPage() {
  const params = useParams();
  const employerId = Number(params.id);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!employerId || Number.isNaN(employerId)) {
      setError("Nieprawidłowy identyfikator firmy");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const resp = await getPublicJobOffers({ page, limit: 20, sortBy: "createDate", sortOrder: "desc", employerId });
        setOffers(resp.jobOffers);
        setTotalPages(resp.pagination.totalPages || 1);
      } catch (e) {
        console.error(e);
        setError("Nie udało się pobrać ofert firmy");
      } finally {
        setLoading(false);
      }
    })();
  }, [employerId, page]);

  const company = useMemo(() => {
    // Aggregate employer profile details from the offers list (some fields come from offer-level data)
    if (!offers || offers.length === 0) return null;

    // Find any profile to get base metadata
    const someProfile = offers.find((o) => o.employerProfile)?.employerProfile;
    if (!someProfile) return null;

    const industrySet = new Set<string>(someProfile.industry ?? []);
    const workingModesSet = new Set<string>();
    const benefitsSet = new Set<string>();
    let companyImageUrl = someProfile.companyImageUrl;
    let description = someProfile.description || undefined;
    let jobCount = 0;

    for (const offer of offers) {
      const profile = offer.employerProfile;
      if (!profile || profile.id !== someProfile.id) continue;
      jobCount += 1;

      if (!companyImageUrl && profile.companyImageUrl) companyImageUrl = profile.companyImageUrl;
      if (!description && (profile.description || offer.description)) description = profile.description || offer.description;

      (profile.industry ?? []).forEach((i) => industrySet.add(i));
      (offer.workingMode ?? []).forEach((m) => workingModesSet.add(m));
      (offer.whatWeOffer ?? []).forEach((b) => benefitsSet.add(b));
    }

    return {
      id: someProfile.id,
      companyName: someProfile.companyName,
      companyImageUrl,
      description,
      industry: Array.from(industrySet).sort((a, b) => a.localeCompare(b)),
      workingModes: Array.from(workingModesSet).sort((a, b) => a.localeCompare(b)),
      benefits: Array.from(benefitsSet).sort((a, b) => a.localeCompare(b)),
      jobCount,
    } as const;
  }, [offers]);

  const truncate = (text?: string, maxLength = 220) => {
    if (!text) return undefined;
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  };

  const workingModeBadgeClasses = (mode: string): string => {
    const m = mode.toLowerCase();
    if (m.includes("zdal")) return "bg-primary/10 text-primary";
    if (m.includes("hybryd")) return "bg-green-100 text-green-800";
    if (m.includes("stacj") || m.includes("biur") || m.includes("on-site")) return "bg-blue-100 text-blue-800";
    return "bg-primary/10 text-primary";
  };

  const formatLocation = (offer: JobOffer): string => {
    const loc = offer.lokalization;
    if (!loc) return "Remote";
    const parts = [loc.street, loc.city, loc.state].filter(Boolean);
    return parts.length ? parts.join(", ") : "Remote";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SmartHeader />
      <main className="flex-1 w-full bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Ładowanie profilu firmy…</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : !company ? (
            <div className="text-center py-20 text-muted-foreground">Nie znaleziono profilu firmy.</div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć
                </button>
              </div>
              {/* Header firmy */}
              <Card className="relative py-3">
                <CardHeader className="flex flex-row items-start gap-4 py-2">
                  <CompanyLogo src={company.companyImageUrl} alt={company.companyName} />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{company.companyName}</CardTitle>
                    {company.description && (
                      <CardDescription className="mt-1">{truncate(company.description, 400)}</CardDescription>
                    )}
                    {company.industry && company.industry.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {company.industry.map((ind, i) => (
                          <Badge
                            key={`${ind}-${i}`}
                            variant="secondary"
                            className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                          >
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {/* job count badge moved to top-right overlay */}
                  </div>
                </CardHeader>

                {/* top-right active offers badge */}
                <div className="absolute right-4 top-3">
                  <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-white border border-red-200 px-2 py-0.5 rounded-md shadow-sm">
                    {company.jobCount} aktywne oferty 
                  </span>
                </div>

                <CardContent className="pt-0 pb-3">
                  {company.workingModes && company.workingModes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-foreground">Model pracy</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {company.workingModes.map((mode, idx) => (
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

                  {company.benefits && company.benefits.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-semibold text-foreground">Benefity dla pracowników</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {company.benefits.slice(0, 6).map((benefit, idx) => (
                          <Badge
                            key={`${benefit}-${idx}`}
                            variant="secondary"
                            className="text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100"
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            {benefit}
                          </Badge>
                        ))}
                        {company.benefits.length > 6 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">+{company.benefits.length - 6} więcej</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Oferty firmy */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Oferty pracy tej firmy</h2>
                {offers.length === 0 ? (
                  <p className="text-muted-foreground">Ta firma nie ma obecnie aktywnych ofert.</p>
                ) : (
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <Link
                        key={offer.id}
                        href={`/job-offers/${offer.id}`}
                        className="block rounded-lg border bg-white p-3 hover:bg-accent/30 hover:shadow-sm transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{offer.name}</p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {formatLocation(offer)}
                            </p>
                          </div>
                          {offer.salary && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{offer.salary}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Poprzednia
                    </Button>
                    <span className="text-sm text-muted-foreground">Strona {page} z {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      Następna
                    </Button>
                  </div>
                )}
              </section>
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
    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
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
        <Building2 className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  );
}
