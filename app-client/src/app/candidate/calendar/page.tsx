"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCandidateMeetings } from "@/services/meetingService";
import { CandidateMeeting } from "@/types/meeting";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, MapPin, X } from "lucide-react";

function pad(n: number) { return n.toString().padStart(2, '0'); }
function formatKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addMonths(d: Date, m: number) { return new Date(d.getFullYear(), d.getMonth()+m, 1); }
function toISODate(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(); }

function getMonthGrid(current: Date) {
  const first = startOfMonth(current);
  const last = endOfMonth(current);
  const firstWeekday = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const daysInMonth = last.getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    const date = new Date(first);
    date.setDate(first.getDate() - (firstWeekday - i));
    cells.push({ date, inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(current.getFullYear(), current.getMonth(), i);
    cells.push({ date, inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const lastCell = cells[cells.length - 1].date;
    const date = new Date(lastCell);
    date.setDate(lastCell.getDate() + 1);
    cells.push({ date, inMonth: false });
  }
  return cells;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatLong(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('pl-PL', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function CandidateCalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<CandidateMeeting[]>([]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailMeeting, setDetailMeeting] = useState<CandidateMeeting | null>(null);

  const firstOfMonth = startOfMonth(current);
  const lastOfMonth = endOfMonth(current);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const from = toISODate(firstOfMonth);
        const to = new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate(), 23, 59, 59).toISOString();
        const { meetings } = await getCandidateMeetings({ from, to });
        setMeetings(meetings);
      } catch (e) {
        console.error('Błąd pobierania spotkań:', e);
        setError('Nie udało się pobrać spotkań.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [firstOfMonth.getTime(), lastOfMonth.getTime()]);

  const meetingsByDay = useMemo(() => {
    const map: Record<string, CandidateMeeting[]> = {};
    for (const m of meetings) {
      const key = formatKey(new Date(m.dateTime));
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [meetings]);

  const cells = useMemo(() => getMonthGrid(current), [current]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Kalendarz spotkań</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())} className="transition-all duration-200 hover:scale-105">Dziś</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrent(addMonths(current, -1))} className="transition-all duration-200 hover:scale-105">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-3 py-1 text-sm font-medium">{current.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</div>
            <Button variant="outline" size="sm" onClick={() => setCurrent(addMonths(current, 1))} className="transition-all duration-200 hover:scale-105">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {/* Weekdays header */}
        <div className="grid grid-cols-7 text-center text-xs uppercase text-muted-foreground mb-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map((w) => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map(({ date, inMonth }, idx) => {
            const key = formatKey(date);
            const dayMeetings = meetingsByDay[key] || [];
            const isToday = formatKey(date) === formatKey(new Date());
            return (
              <div
                key={idx}
                className={`min-h-[110px] rounded-lg border p-2 flex flex-col ${inMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${isToday ? 'border-primary' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{date.getDate()}</div>
                  {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Dziś</span>}
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  {dayMeetings.slice(0, 3).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setDetailMeeting(m)}
                      className="w-full text-left text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition truncate"
                      title={`${formatTime(m.dateTime)} • ${m.application.jobOffer.name}`}
                    >
                      <span className="font-medium mr-1">{formatTime(m.dateTime)}</span>
                      {m.application.jobOffer.name}
                    </button>
                  ))}
                  {dayMeetings.length > 3 && (
                    <button onClick={() => { setSelectedDay(date); }} className="text-[11px] text-primary hover:underline">
                      +{dayMeetings.length - 3} więcej
                    </button>
                  )}
                </div>
                {dayMeetings.length > 0 && (
                  <Button variant="outline" size="sm" className="mt-2 text-xs h-7 transition-all duration-200 hover:scale-105" onClick={() => setSelectedDay(date)}>
                    Zobacz
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Day drawer/list */}
        {selectedDay && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedDay(null)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Spotkania dnia</div>
                  <div className="text-lg font-semibold">{selectedDay.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-3 overflow-auto h-[calc(100%-56px)] pr-2">
                {(meetingsByDay[formatKey(selectedDay)] || []).map(m => (
                  <div key={m.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" /> {formatLong(m.dateTime)}
                        </div>
                        <div className="mt-1 text-sm"><strong>Oferta:</strong> {m.application.jobOffer.name}</div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          {m.type === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          {m.type === 'ONLINE' ? 'Online' : 'Stacjonarnie'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/job-offers/${m.application.jobOffer.id}`}>
                          <Button size="sm" className="transition-all duration-200 hover:scale-105">Oferta</Button>
                        </Link>
                        <Link href={`/candidate/applications`}>
                          <Button size="sm" className="transition-all duration-200 hover:scale-105">Aplikacja</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {(meetingsByDay[formatKey(selectedDay)] || []).length === 0 && (
                  <div className="text-center text-muted-foreground mt-8">Brak spotkań w tym dniu</div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 text-center text-sm text-muted-foreground">Ładowanie spotkań…</div>
        )}
      </div>
    </div>
  );
}
