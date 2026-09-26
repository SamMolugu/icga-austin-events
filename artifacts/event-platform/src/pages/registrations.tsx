import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Mail, UsersRound } from 'lucide-react';
import { getListOrganizerEventsQueryKey, useListOrganizerEvents, type Event } from '@workspace/api-client-react';
import { AppShell, EmptyState, ErrorState, Field, PageHeading, Skeleton, inputClass } from '@/components/gatherly';

type Registration = { id: number; eventId: number; name: string; email: string; status: string; createdAt: string };

export default function Registrations() {
  const eventsQuery = useListOrganizerEvents(undefined, { query: { queryKey: getListOrganizerEventsQueryKey() } });
  const events = eventsQuery.data ?? [];
  const [eventId, setEventId] = useState('');
  const [rows, setRows] = useState<Registration[]>([]);
  const selectedEvent = useMemo(() => events.find((event) => String(event.id) === eventId), [events, eventId]);
  useEffect(() => { if (!eventId && events[0]) setEventId(String(events[0].id)); }, [events, eventId]);
  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/registrations?eventId=${eventId}`).then((response) => response.ok ? response.json() as Promise<Registration[]> : []).then(setRows);
  }, [eventId]);
  if (eventsQuery.isLoading) return <AppShell><PageHeading eyebrow="ICGA organizer desk / Attendance" title="Know who is coming." /><Skeleton className="h-96" /></AppShell>;
  if (eventsQuery.isError) return <AppShell><ErrorState onRetry={() => eventsQuery.refetch()} /></AppShell>;
  const confirmed = rows.filter((row) => row.status === 'confirmed').length;
  return <AppShell><div className="page-in"><PageHeading eyebrow="ICGA organizer desk / Attendance" title="Know who is coming." description="Review registrations, headcount, and waitlist status for each ICGA program." />
    <div className="mb-6 rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6"><Field label="Event"><select className={inputClass} value={eventId} onChange={(event) => setEventId(event.target.value)}>{events.map((item: Event) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field></div>
    {selectedEvent && <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-primary bg-primary p-5 text-primary-foreground"><UsersRound size={19} className="text-accent" /><p className="mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-primary-foreground/60">Confirmed</p><p className="mt-1 font-display text-4xl font-bold">{confirmed}</p></div><div className="rounded-2xl border border-card-border bg-card p-5"><CheckCircle2 size={19} className="text-primary" /><p className="mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Capacity used</p><p className="mt-1 font-display text-4xl font-bold">{selectedEvent.capacity ? Math.round((confirmed / selectedEvent.capacity) * 100) : 0}%</p></div><div className="rounded-2xl border border-card-border bg-card p-5"><Mail size={19} className="text-primary" /><p className="mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Waitlist</p><p className="mt-1 font-display text-4xl font-bold">{rows.filter((row) => row.status === 'waitlisted').length}</p></div></div>}
    <section className="rounded-2xl border border-card-border bg-card shadow-xs"><div className="border-b border-border p-5 sm:p-6"><h2 className="font-display text-2xl font-bold">Attendee list</h2></div>{rows.length === 0 ? <div className="p-5"><EmptyState title="No registrations yet" detail="As people save a seat, their names and status will appear here." /></div> : <div className="divide-y divide-border">{rows.map((row) => <div key={row.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="font-semibold">{row.name}</p><p className="mt-1 text-xs text-muted-foreground">{row.email} · registered {new Date(row.createdAt).toLocaleDateString()}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${row.status === 'confirmed' ? 'bg-accent/25 text-primary' : 'bg-muted text-muted-foreground'}`}>{row.status}</span></div>)}</div>}</section>
  </div></AppShell>;
}