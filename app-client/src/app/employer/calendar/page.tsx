"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  getEmployerMeetings, 
  deleteEmployerMeeting, 
  updateEmployerMeeting 
} from "@/services/meetingService";
import { EmployerMeeting } from "@/types/meeting";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video,
  MapPin,
  User,
  Pencil,
  Trash2,
  X
} from "lucide-react";

function pad(n: number) { return n.toString().padStart(2, '0'); }
function formatKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addMonths(d: Date, m: number) { return new Date(d.getFullYear(), d.getMonth()+m, 1); }
function toISODate(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(); }

function getMonthGrid(current: Date) {
  // Week starts Monday
  const first = startOfMonth(current);
  const last = endOfMonth(current);
  const firstWeekday = (first.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const daysInMonth = last.getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  // previous month days
  for (let i = 0; i < firstWeekday; i++) {
    const date = new Date(first);
    date.setDate(first.getDate() - (firstWeekday - i));
    cells.push({ date, inMonth: false });
  }
  // current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(current.getFullYear(), current.getMonth(), i);
    cells.push({ date, inMonth: true });
  }
  // next month days to fill 42 cells
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

export default function EmployerCalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<EmployerMeeting[]>([]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailMeeting, setDetailMeeting] = useState<EmployerMeeting | null>(null);
  const [editState, setEditState] = useState<{ show: boolean; meeting: EmployerMeeting | null }>({ show: false, meeting: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; meetingId: number | null }>({ show: false, meetingId: null });

  const firstOfMonth = startOfMonth(current);
  const lastOfMonth = endOfMonth(current);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const from = toISODate(firstOfMonth);
        const to = new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate(), 23, 59, 59).toISOString();
        const { meetings } = await getEmployerMeetings({ from, to });
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
    const map: Record<string, EmployerMeeting[]> = {};
    for (const m of meetings) {
      const key = formatKey(new Date(m.dateTime));
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [meetings]);

  const cells = useMemo(() => getMonthGrid(current), [current]);

  const [editForm, setEditForm] = useState({
    dateTime: '',
    type: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    contributors: '',
    onlineMeetingUrl: '',
    message: ''
  });

  useEffect(() => {
    if (editState.show && editState.meeting) {
      const m = editState.meeting;
      const dt = new Date(m.dateTime);
      const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      setEditForm({
        dateTime: local,
        type: m.type,
        contributors: m.contributors || '',
        onlineMeetingUrl: m.onlineMeetingUrl || '',
        message: m.message || ''
      });
    }
  }, [editState.show, editState.meeting]);

  const refresh = async () => {
    try {
      setLoading(true);
      const from = toISODate(firstOfMonth);
      const to = new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate(), 23, 59, 59).toISOString();
      const { meetings } = await getEmployerMeetings({ from, to });
      setMeetings(meetings);
    } finally {
      setLoading(false);
    }
  };

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
                        <div className="mt-1 text-sm flex items-center gap-1"><User className="w-4 h-4" /> {m.application.candidateProfile.name || ''} {m.application.candidateProfile.lastName || ''}</div>
                        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                          {m.type === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          {m.type === 'ONLINE' ? 'Online' : 'Stacjonarnie'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditState({ show: true, meeting: m })} className="transition-all duration-200 hover:scale-105">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ show: true, meetingId: m.id })} className="text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link href={`/employer/applications/${m.application.id}`}>
                        <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105">Szczegóły aplikacji</Button>
                      </Link>
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

        {/* Meeting detail quick modal */}
        {detailMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDetailMeeting(null)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Szczegóły spotkania</h3>
                <Button variant="ghost" size="sm" onClick={() => setDetailMeeting(null)}><X className="w-5 h-5" /></Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {formatLong(detailMeeting.dateTime)}</div>
                <div><strong>Oferta:</strong> {detailMeeting.application.jobOffer.name}</div>
                <div className="flex items-center gap-1"><User className="w-4 h-4" /> {detailMeeting.application.candidateProfile.name || ''} {detailMeeting.application.candidateProfile.lastName || ''}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {detailMeeting.type === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  {detailMeeting.type === 'ONLINE' ? 'Online' : 'Stacjonarnie'}
                </div>
                {detailMeeting.contributors && <div><strong>Uczestnicy:</strong> {detailMeeting.contributors}</div>}
                {detailMeeting.onlineMeetingUrl && (
                  <div>
                    <a className="text-primary hover:underline" href={detailMeeting.onlineMeetingUrl} target="_blank">Link do spotkania</a>
                  </div>
                )}
                {detailMeeting.message && <div className="text-muted-foreground">{detailMeeting.message}</div>}
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <Link href={`/employer/applications/${detailMeeting.application.id}`}>
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">Szczegóły aplikacji</Button>
                </Link>
                <Button onClick={() => { setEditState({ show: true, meeting: detailMeeting }); setDetailMeeting(null); }} className="transition-all duration-200 hover:scale-105" variant="outline"><Pencil className="w-4 h-4 mr-1"/>Edytuj</Button>
                <Button onClick={() => { setDeleteConfirm({ show: true, meetingId: detailMeeting.id }); setDetailMeeting(null); }} className="transition-all duration-200 hover:scale-105" variant="destructive">Usuń</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editState.show && editState.meeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Edytuj spotkanie</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data i godzina</label>
                  <input type="datetime-local" value={editForm.dateTime} onChange={e => setEditForm({ ...editForm, dateTime: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Typ spotkania</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value as 'ONLINE' | 'OFFLINE' })} className="w-full p-2 border rounded">
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Stacjonarnie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Uczestnicy</label>
                  <input value={editForm.contributors} onChange={e => setEditForm({ ...editForm, contributors: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                {editForm.type === 'ONLINE' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Link do spotkania</label>
                    <input value={editForm.onlineMeetingUrl} onChange={e => setEditForm({ ...editForm, onlineMeetingUrl: e.target.value })} className="w-full p-2 border rounded" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Notatka</label>
                  <textarea value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })} className="w-full p-2 border rounded h-20 resize-none" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditState({ show: false, meeting: null })} className="transition-all duration-200 hover:scale-105">Anuluj</Button>
                <Button 
                  onClick={async () => {
                    if (!editState.meeting) return;
                    try {
                      await updateEmployerMeeting(editState.meeting.id, {
                        dateTime: editForm.dateTime ? new Date(editForm.dateTime).toISOString() : undefined,
                        type: editForm.type,
                        contributors: editForm.contributors || undefined,
                        onlineMeetingUrl: editForm.type === 'ONLINE' ? (editForm.onlineMeetingUrl || undefined) : undefined,
                        message: editForm.message || undefined
                      });
                      setEditState({ show: false, meeting: null });
                      await refresh();
                    } catch (e) {
                      console.error('Błąd podczas aktualizacji spotkania:', e);
                      alert('Błąd podczas aktualizacji spotkania');
                    }
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >Zapisz</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Usuń spotkanie</h3>
              <p className="text-sm text-gray-600 mb-4">Czy na pewno chcesz usunąć to spotkanie? Tej akcji nie można cofnąć.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm({ show: false, meetingId: null })} className="transition-all duration-200 hover:scale-105">Anuluj</Button>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    if (!deleteConfirm.meetingId) return;
                    try {
                      await deleteEmployerMeeting(deleteConfirm.meetingId);
                      setDeleteConfirm({ show: false, meetingId: null });
                      await refresh();
                    } catch (e) {
                      console.error('Błąd podczas usuwania spotkania:', e);
                      alert('Błąd podczas usuwania spotkania');
                    }
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >Usuń</Button>
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
