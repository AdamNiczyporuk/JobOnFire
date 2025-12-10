"use client";

import ToolSidebar from "@/components/ToolSidebar";
import { SmartHeader } from "@/components/SmartHeader";
import { useEffect, useMemo, useState } from "react";

type ContractType = "UOP" | "UZ" | "UOD" | "B2B";

type Inputs = {
  amount: number; // input amount (either brutto or netto)
  mode: "BRUTTO" | "NETTO";
  contract: ContractType;
  // UoP
  pit2: boolean; // kwota zmniejszająca zaliczkę 300 zł
  ulgaMlodzi: boolean; // ulga dla młodych (PIT 0%)
  // Umowa zlecenie / o dzieło
  kupPercent: 0.2 | 0.5; // koszty uzyskania 20% lub 50%
  chorobowaUZ: boolean; // czy opłacana chorobowa (opcjonalna) dla UZ
  // B2B
  b2bTaxForm: "SCALE_12" | "LINEAR_19";
  b2bMonthlySocial: number; // składki społeczne (miesięcznie)
  b2bMonthlyCosts: number; // koszty uzyskania (faktury, koszty)
};

// Stałe (uproszczone, orientacyjne — mogą nie uwzględniać wszystkich wyjątków prawnych)
const RATES = {
  employee: {
    emerytalna: 0.0976,
    rentowa: 0.015,
    chorobowa: 0.0245,
    zdrowotna: 0.09,
  },
  employer: {
    emerytalna: 0.0976,
    rentowa: 0.065,
    wypadkowa: 0.0167, // przyjęta orientacyjna stawka
    fp: 0.0245,
    fgsp: 0.001,
  },
  pit: {
    stawka: 0.12,
    kwotaZmniejszajaca: 300, // gdy PIT-2
    kup: 250, // koszty uzyskania przychodu (standard)
  },
};

function toCurrency(v: number) {
  return v.toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Wyniki kalkulacji — dyskryminowana unia po polu kind
type ResultBase = { netto: number; kosztPracodawcy: number; kind: ContractType };
type ResultUOP = ResultBase & {
  kind: "UOP";
  breakdown: {
    pracownik: { emerytalna: number; rentowa: number; chorobowa: number; zdrowotna: number; zaliczkaPIT: number; podstawaPIT: number };
    pracodawca: { emerytalna: number; rentowa: number; wypadkowa: number; fp: number; fgsp: number };
  };
};
type ResultUZ = ResultBase & {
  kind: "UZ";
  breakdown: {
    pracownik: { emerytalna: number; rentowa: number; chorobowa: number; zdrowotna: number; zaliczkaPIT: number; podstawaPIT: number };
    pracodawca: { emerytalna: number; rentowa: number; wypadkowa: number; fp: number; fgsp: number };
  };
};
type ResultUOD = ResultBase & {
  kind: "UOD";
  breakdown: { pracownik: { zaliczkaPIT: number; podstawaPIT: number; kup: number } };
};
type ResultB2B = ResultBase & {
  kind: "B2B";
  breakdown: { b2b: { base: number; pit: number; health: number; social: number; costs: number; taxRate: number } };
};
type ResultUnion = ResultUOP | ResultUZ | ResultUOD | ResultB2B;

// Uproszczona kalkulacja netto z brutto dla umowy o pracę
function calcFromBrutto(brutto: number, opts: { pit2: boolean; ulgaMlodzi: boolean }): ResultUOP {
  const emp = RATES.employee;
  const pit = RATES.pit;

  const skladkaEmerytalnaPrac = round2(brutto * emp.emerytalna);
  const skladkaRentowaPrac = round2(brutto * emp.rentowa);
  const skladkaChorobowaPrac = round2(brutto * emp.chorobowa);
  const sumaSpolecznePrac = round2(skladkaEmerytalnaPrac + skladkaRentowaPrac + skladkaChorobowaPrac);

  const podstawaZdrowotnej = brutto - sumaSpolecznePrac;
  const skladkaZdrowotna = round2(podstawaZdrowotnej * emp.zdrowotna);

  // Podstawa PIT (zaokrąglona do pełnych zł zgodnie z praktyką zaliczek)
  const podstawaPIT = Math.max(0, Math.floor(podstawaZdrowotnej - pit.kup));
  let zaliczkaPIT = opts.ulgaMlodzi ? 0 : Math.max(0, Math.round(podstawaPIT * pit.stawka - (opts.pit2 ? pit.kwotaZmniejszajaca : 0)));

  const netto = round2(brutto - sumaSpolecznePrac - skladkaZdrowotna - zaliczkaPIT);

  // Koszt pracodawcy
  const er = RATES.employer;
  const skladkaEmerytalnaPracod = round2(brutto * er.emerytalna);
  const skladkaRentowaPracod = round2(brutto * er.rentowa);
  const skladkaWypadkowa = round2(brutto * er.wypadkowa);
  const fp = round2(brutto * er.fp);
  const fgsp = round2(brutto * er.fgsp);
  const sumaPracodawca = round2(skladkaEmerytalnaPracod + skladkaRentowaPracod + skladkaWypadkowa + fp + fgsp);
  const kosztPracodawcy = round2(brutto + sumaPracodawca);

  return {
    kind: "UOP",
    netto,
    kosztPracodawcy,
    breakdown: {
      pracownik: {
        emerytalna: skladkaEmerytalnaPrac,
        rentowa: skladkaRentowaPrac,
        chorobowa: skladkaChorobowaPrac,
        zdrowotna: skladkaZdrowotna,
        zaliczkaPIT,
        podstawaPIT,
      },
      pracodawca: {
        emerytalna: skladkaEmerytalnaPracod,
        rentowa: skladkaRentowaPracod,
        wypadkowa: skladkaWypadkowa,
        fp,
        fgsp,
      },
    },
  };
}

// Umowa zlecenie: uproszczona kalkulacja
function calcUZFromBrutto(brutto: number, opts: { kupPercent: number; chorobowa: boolean; ulgaMlodzi: boolean }): ResultUZ {
  const emp = RATES.employee;
  const pit = RATES.pit;

  const emerytalna = round2(brutto * emp.emerytalna);
  const rentowa = round2(brutto * emp.rentowa);
  const chorobowa = opts.chorobowa ? round2(brutto * emp.chorobowa) : 0;
  const spoleczne = round2(emerytalna + rentowa + chorobowa);

  const podstawaZdrowotnej = brutto - spoleczne;
  const zdrowotna = round2(podstawaZdrowotnej * emp.zdrowotna);

  const podstawaPIT = Math.max(0, Math.floor(podstawaZdrowotnej - opts.kupPercent * (brutto - spoleczne)));
  const zaliczkaPIT = opts.ulgaMlodzi ? 0 : Math.max(0, Math.round(podstawaPIT * pit.stawka));

  const netto = round2(brutto - spoleczne - zdrowotna - zaliczkaPIT);

  // Koszt pracodawcy (składki pracodawcy UZ analogicznie do UoP — uproszczone)
  const er = RATES.employer;
  const pracodEmerytalna = round2(brutto * er.emerytalna);
  const pracodRentowa = round2(brutto * er.rentowa);
  const wypadkowa = round2(brutto * er.wypadkowa);
  const fp = round2(brutto * er.fp);
  const fgsp = round2(brutto * er.fgsp);
  const sumaPracod = round2(pracodEmerytalna + pracodRentowa + wypadkowa + fp + fgsp);
  const kosztPracodawcy = round2(brutto + sumaPracod);

  return {
    kind: "UZ",
    netto,
    kosztPracodawcy,
    breakdown: {
      pracownik: { emerytalna, rentowa, chorobowa, zdrowotna, zaliczkaPIT, podstawaPIT },
      pracodawca: { emerytalna: pracodEmerytalna, rentowa: pracodRentowa, wypadkowa, fp, fgsp },
    },
  };
}

// Umowa o dzieło: brak ZUS, tylko PIT z KUP 20%/50%
function calcUODFromBrutto(brutto: number, opts: { kupPercent: number }): ResultUOD {
  const pitRate = RATES.pit.stawka;
  const kup = round2(opts.kupPercent * brutto);
  const podstawaPIT = Math.max(0, Math.floor(brutto - kup));
  const zaliczkaPIT = Math.max(0, Math.round(podstawaPIT * pitRate));
  const netto = round2(brutto - zaliczkaPIT);
  const kosztPracodawcy = round2(brutto); // brak składek pracodawcy
  return {
    kind: "UOD",
    netto,
    kosztPracodawcy,
    breakdown: {
      pracownik: { zaliczkaPIT, podstawaPIT, kup },
    },
  };
}

// B2B: uproszczenie — przyjmujemy kwotę na fakturze (netto, bez VAT) jako "brutto" w kalkulatorze
function calcB2BFromRevenue(revenue: number, opts: { taxForm: "SCALE_12" | "LINEAR_19"; monthlySocial: number; monthlyCosts: number }): ResultB2B {
  const taxRate = opts.taxForm === "LINEAR_19" ? 0.19 : 0.12;
  const healthRate = opts.taxForm === "LINEAR_19" ? 0.049 : 0.09; // uproszczenie
  const base = Math.max(0, revenue - opts.monthlySocial - opts.monthlyCosts);
  const health = round2(base * healthRate);
  const pit = round2(base * taxRate);
  const netto = round2(revenue - opts.monthlySocial - health - pit);
  const kosztPracodawcy = round2(revenue); // klient płaci kwotę z faktury (bez VAT)
  return {
    kind: "B2B",
    netto,
    kosztPracodawcy,
    breakdown: {
      b2b: { base, pit, health, social: opts.monthlySocial, costs: opts.monthlyCosts, taxRate },
    },
  };
}

// Prosta odwrotność: znajdź brutto dające zadane netto (binary search)
function bruttoFromNetto(targetNetto: number, calc: (brutto: number) => { netto: number }) {
  let low = 1;
  let high = 50000; // górny zakres wyszukiwania miesięcznej pensji
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const res = calc(mid);
    if (res.netto < targetNetto) low = mid; else high = mid;
  }
  return high;
}

export default function SalaryCalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>({
    amount: 8000,
    mode: "BRUTTO",
    contract: "UOP",
    pit2: true,
    ulgaMlodzi: false,
    kupPercent: 0.2,
    chorobowaUZ: false,
    b2bTaxForm: "SCALE_12",
    b2bMonthlySocial: 1600,
    b2bMonthlyCosts: 1000,
  });
  const [brutto, setBrutto] = useState<number>(inputs.amount);

  useEffect(() => {
    if (inputs.mode === "BRUTTO") {
      setBrutto(inputs.amount || 0);
    } else {
      // odwracanie netto->brutto zależnie od rodzaju umowy
      const calc = (b: number) => {
        switch (inputs.contract) {
          case "UOP":
            return calcFromBrutto(b, { pit2: inputs.pit2, ulgaMlodzi: inputs.ulgaMlodzi });
          case "UZ":
            return calcUZFromBrutto(b, { kupPercent: inputs.kupPercent, chorobowa: inputs.chorobowaUZ, ulgaMlodzi: inputs.ulgaMlodzi });
          case "UOD":
            return calcUODFromBrutto(b, { kupPercent: inputs.kupPercent });
          case "B2B":
            return calcB2BFromRevenue(b, { taxForm: inputs.b2bTaxForm, monthlySocial: inputs.b2bMonthlySocial, monthlyCosts: inputs.b2bMonthlyCosts });
        }
      };
      const b = bruttoFromNetto(inputs.amount || 0, calc);
      setBrutto(b);
    }
  }, [inputs]);

  const result = useMemo<ResultUnion>(() => {
    switch (inputs.contract) {
      case "UOP":
        return calcFromBrutto(brutto || 0, { pit2: inputs.pit2, ulgaMlodzi: inputs.ulgaMlodzi });
      case "UZ":
        return calcUZFromBrutto(brutto || 0, { kupPercent: inputs.kupPercent, chorobowa: inputs.chorobowaUZ, ulgaMlodzi: inputs.ulgaMlodzi });
      case "UOD":
        return calcUODFromBrutto(brutto || 0, { kupPercent: inputs.kupPercent });
      case "B2B":
        return calcB2BFromRevenue(brutto || 0, { taxForm: inputs.b2bTaxForm, monthlySocial: inputs.b2bMonthlySocial, monthlyCosts: inputs.b2bMonthlyCosts });
    }
  }, [brutto, inputs]);

  return (
    <div className="flex min-h-screen flex-col items-center">
      <SmartHeader />
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <ToolSidebar />

            <section className="flex-1">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Kalkulator wynagrodzeń</h1>
                <p className="text-xs text-muted-foreground mt-1">Uproszczony kalkulator brutto-netto dla umowy o pracę (PL).</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Formularz */}
                <div className="bg-white rounded-xl p-5 shadow-md border">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rodzaj umowy</label>
                      <select
                        value={inputs.contract}
                        onChange={(e) => setInputs((p) => ({ ...p, contract: e.target.value as ContractType }))}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="UOP">Umowa o pracę</option>
                        <option value="UZ">Umowa zlecenie</option>
                        <option value="UOD">Umowa o dzieło</option>
                        <option value="B2B">B2B (faktura bez VAT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kwota</label>
                      <input
                        type="number"
                        min={0}
                        value={inputs.amount}
                        onChange={(e) => setInputs((p) => ({ ...p, amount: Number(e.target.value) }))}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        placeholder="np. 8000"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Wprowadź kwotę {inputs.mode === "BRUTTO" ? "brutto" : "netto"} miesięcznie.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tryb kwoty</label>
                      <div className="flex items-center gap-3 text-sm">
                        <label className="inline-flex items-center gap-2">
                          <input type="radio" name="mode" checked={inputs.mode === "BRUTTO"} onChange={() => setInputs((p) => ({ ...p, mode: "BRUTTO" }))} />
                          Brutto
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input type="radio" name="mode" checked={inputs.mode === "NETTO"} onChange={() => setInputs((p) => ({ ...p, mode: "NETTO" }))} />
                          Netto
                        </label>
                      </div>
                    </div>

                    {/* Parametry specyficzne dla umów */}
                    {inputs.contract === "UOP" && (
                      <div className="flex flex-col gap-3">
                        <div className="text-sm">
                          <label className="block font-medium mb-1">PIT-2 (kwota zmniejszająca 300 zł)</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="pit2" checked={inputs.pit2 === true} onChange={() => setInputs((p) => ({ ...p, pit2: true }))} />
                              Tak
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="pit2" checked={inputs.pit2 === false} onChange={() => setInputs((p) => ({ ...p, pit2: false }))} />
                              Nie
                            </label>
                          </div>
                        </div>
                        <div className="text-sm">
                          <label className="block font-medium mb-1">Ulga dla młodych (PIT 0%)</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="ulgaMlodzi" checked={inputs.ulgaMlodzi === true} onChange={() => setInputs((p) => ({ ...p, ulgaMlodzi: true }))} />
                              Tak
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="ulgaMlodzi" checked={inputs.ulgaMlodzi === false} onChange={() => setInputs((p) => ({ ...p, ulgaMlodzi: false }))} />
                              Nie
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {inputs.contract === "UZ" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={inputs.chorobowaUZ} onChange={(e) => setInputs((p) => ({ ...p, chorobowaUZ: e.target.checked }))} />
                            Składka chorobowa (opcjonalna)
                          </label>
                          <div className="text-sm">
                            <label className="block font-medium mb-1">Koszty uzyskania</label>
                            <div className="flex items-center gap-3">
                              <label className="inline-flex items-center gap-2"><input type="radio" name="kupUZ" checked={inputs.kupPercent === 0.2} onChange={() => setInputs((p) => ({ ...p, kupPercent: 0.2 }))} /> 20%</label>
                              <label className="inline-flex items-center gap-2"><input type="radio" name="kupUZ" checked={inputs.kupPercent === 0.5} onChange={() => setInputs((p) => ({ ...p, kupPercent: 0.5 }))} /> 50%</label>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Uproszczenie: pominięto przypadki zwolnień (np. studenci do 26 r.ż.).</p>
                      </div>
                    )}

                    {inputs.contract === "UOD" && (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <label className="block font-medium mb-1">Koszty uzyskania</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2"><input type="radio" name="kupUOD" checked={inputs.kupPercent === 0.2} onChange={() => setInputs((p) => ({ ...p, kupPercent: 0.2 }))} /> 20%</label>
                            <label className="inline-flex items-center gap-2"><input type="radio" name="kupUOD" checked={inputs.kupPercent === 0.5} onChange={() => setInputs((p) => ({ ...p, kupPercent: 0.5 }))} /> 50%</label>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Uproszczenie: brak ZUS, tylko zaliczka PIT od podstawy po KUP.</p>
                      </div>
                    )}

                    {inputs.contract === "B2B" && (
                      <div className="grid gap-3">
                        <div className="text-sm">
                          <label className="block font-medium mb-1">Forma opodatkowania</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2"><input type="radio" name="b2bTax" checked={inputs.b2bTaxForm === "SCALE_12"} onChange={() => setInputs((p) => ({ ...p, b2bTaxForm: "SCALE_12" }))} /> Skala (12%)</label>
                            <label className="inline-flex items-center gap-2"><input type="radio" name="b2bTax" checked={inputs.b2bTaxForm === "LINEAR_19"} onChange={() => setInputs((p) => ({ ...p, b2bTaxForm: "LINEAR_19" }))} /> Liniowy (19%)</label>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Składki społeczne (m-c)</label>
                            <input type="number" min={0} value={inputs.b2bMonthlySocial} onChange={(e) => setInputs((p) => ({ ...p, b2bMonthlySocial: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Koszty (m-c)</label>
                            <input type="number" min={0} value={inputs.b2bMonthlyCosts} onChange={(e) => setInputs((p) => ({ ...p, b2bMonthlyCosts: Number(e.target.value) }))} className="w-full border rounded-md px-3 py-2 text-sm" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Uproszczenie: składka zdrowotna liczona jako {inputs.b2bTaxForm === "LINEAR_19" ? "4.9%" : "9%"} dochodu; brak odliczeń zdrowotnej w PIT.</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Uwaga: wynik jest orientacyjny i nie stanowi porady podatkowej. Stawki uproszczone, bez wyjątków.
                    </p>
                  </div>
                </div>

                {/* Wynik */}
                <div className="bg-white rounded-xl p-5 shadow-md border">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Kwota brutto</span>
                      <span className="font-semibold">{toCurrency(brutto)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Na rękę (netto)</span>
                      <span className="text-lg font-bold text-green-700">{toCurrency(result.netto)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Koszt pracodawcy</span>
                      <span className="font-semibold">{toCurrency(result.kosztPracodawcy)}</span>
                    </div>

                    {/* Roczne przeliczenie */}
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Rocznie (x12)</p>
                      <div className="flex items-center justify-between text-sm"><span>Netto</span><span className="font-medium">{toCurrency(result.netto * 12)}</span></div>
                      <div className="flex items-center justify-between text-sm"><span>Koszt pracodawcy</span><span className="font-medium">{toCurrency(result.kosztPracodawcy * 12)}</span></div>
                    </div>

                    <div className="pt-3 border-t">
                      {result.kind === "UOP" && (
                        <>
                          <p className="text-sm font-medium mb-2">Składki pracownika</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Emerytalna 9.76%</span><span>{toCurrency(result.breakdown.pracownik.emerytalna)}</span></div>
                            <div className="flex justify-between"><span>Rentowa 1.5%</span><span>{toCurrency(result.breakdown.pracownik.rentowa)}</span></div>
                            <div className="flex justify-between"><span>Chorobowa 2.45%</span><span>{toCurrency(result.breakdown.pracownik.chorobowa)}</span></div>
                            <div className="flex justify-between"><span>Zdrowotna 9%</span><span>{toCurrency(result.breakdown.pracownik.zdrowotna)}</span></div>
                            <div className="flex justify-between"><span>Zaliczka PIT</span><span>{toCurrency(result.breakdown.pracownik.zaliczkaPIT)}</span></div>
                          </div>
                        </>
                      )}

                      {result.kind === "UZ" && (
                        <>
                          <p className="text-sm font-medium mb-2">Obciążenia zleceniobiorcy</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Emerytalna 9.76%</span><span>{toCurrency(result.breakdown.pracownik.emerytalna)}</span></div>
                            <div className="flex justify-between"><span>Rentowa 1.5%</span><span>{toCurrency(result.breakdown.pracownik.rentowa)}</span></div>
                            {inputs.chorobowaUZ && <div className="flex justify-between"><span>Chorobowa 2.45%</span><span>{toCurrency(result.breakdown.pracownik.chorobowa)}</span></div>}
                            <div className="flex justify-between"><span>Zdrowotna 9%</span><span>{toCurrency(result.breakdown.pracownik.zdrowotna)}</span></div>
                            <div className="flex justify-between"><span>Zaliczka PIT</span><span>{toCurrency(result.breakdown.pracownik.zaliczkaPIT)}</span></div>
                          </div>
                        </>
                      )}

                      {result.kind === "UOD" && (
                        <>
                          <p className="text-sm font-medium mb-2">Podatek</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Podstawa PIT</span><span>{toCurrency(result.breakdown.pracownik.podstawaPIT)}</span></div>
                            <div className="flex justify-between"><span>KUP {Math.round(inputs.kupPercent * 100)}%</span><span>{toCurrency(result.breakdown.pracownik.kup)}</span></div>
                            <div className="flex justify-between"><span>Zaliczka PIT</span><span>{toCurrency(result.breakdown.pracownik.zaliczkaPIT)}</span></div>
                          </div>
                        </>
                      )}

                      {result.kind === "B2B" && (
                        <>
                          <p className="text-sm font-medium mb-2">Rozliczenie B2B</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>Dochód (po ZUS i kosztach)</span><span>{toCurrency(result.breakdown.b2b.base)}</span></div>
                            <div className="flex justify-between"><span>Składki społeczne</span><span>{toCurrency(result.breakdown.b2b.social)}</span></div>
                            <div className="flex justify-between"><span>Składka zdrowotna</span><span>{toCurrency(result.breakdown.b2b.health)}</span></div>
                            <div className="flex justify-between"><span>PIT ({Math.round(result.breakdown.b2b.taxRate * 100)}%)</span><span>{toCurrency(result.breakdown.b2b.pit)}</span></div>
                            <div className="flex justify-between"><span>Koszty</span><span>{toCurrency(result.breakdown.b2b.costs)}</span></div>
                          </div>
                        </>
                      )}
                    </div>

                    {(result.kind === "UOP" || result.kind === "UZ") && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Składki pracodawcy</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span>Emerytalna 9.76%</span><span>{toCurrency(result.breakdown.pracodawca.emerytalna)}</span></div>
                          <div className="flex justify-between"><span>Rentowa 6.5%</span><span>{toCurrency(result.breakdown.pracodawca.rentowa)}</span></div>
                          <div className="flex justify-between"><span>Wypadkowa 1.67%</span><span>{toCurrency(result.breakdown.pracodawca.wypadkowa)}</span></div>
                          <div className="flex justify-between"><span>FP 2.45%</span><span>{toCurrency(result.breakdown.pracodawca.fp)}</span></div>
                          <div className="flex justify-between"><span>FGŚP 0.10%</span><span>{toCurrency(result.breakdown.pracodawca.fgsp)}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                Kalkulacja uproszczona. UoP: standardowe KUP 250 zł, PIT 12%, zdrowotna 9%, PIT-2 = 300 zł/m-c. ZUS wypadkowe = 1.67%.
                UZ: KUP 20%/50%, opcjonalna chorobowa. UoD: tylko PIT od podstawy po KUP 20%/50%. B2B: przyjęto zdrowotną {inputs.b2bTaxForm === "LINEAR_19" ? "4.9%" : "9%"} dochodu, bez odliczeń; koszty/ZUS wg pól.
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
