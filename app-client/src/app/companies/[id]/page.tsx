"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SmartHeader } from "@/components/SmartHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicJobOffers } from "@/services/jobOfferService";
import type { JobOffer } from "@/types/jobOffer";
import { Building2, MapPin } from "lucide-react";

export default function CompanyPublicPage() {
  const params = useParams();
  const employerId = Number(params.id);
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
    return offers.find(o => o.employerProfile)?.employerProfile || null;
  }, [offers]);

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
              {/* Header firmy */}
              <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                  <CompanyLogo src={company.companyImageUrl} alt={company.companyName} />
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{company.companyName}</CardTitle>
                    {company.description && (
                      <CardDescription className="mt-1">{company.description}</CardDescription>
                    )}
                    {company.industry && company.industry.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {company.industry.map((ind, i) => (
                          <Badge key={`${ind}-${i}`} variant="secondary" className="text-xs">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
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
