import { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, X } from 'lucide-react';
import { getListOrganizerEventsQueryKey, useListOrganizerEvents } from '@workspace/api-client-react';
import { AppShell, Button, EmptyState, ErrorState, Field, PageHeading, Skeleton, inputClass } from '@/components/gatherly';

type Flyer = { id: number; eventId: number; title: string; imageUrl: string; submittedBy: string; status: string; reviewNote: string | null };

export default function Flyers() {
  const eventsQuery = useListOrganizerEvents(undefined, { query: { queryKey: getListOrganizerEventsQueryKey() } });
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ eventId: '', title: '', imageUrl: '', submittedBy: '' });
  const [filter, setFilter] = useState('pending');
  const names = useMemo(() => new Map((eventsQuery.data ?? []).map((event) => [event.id, event.title])), [eventsQuery.data]);
  const load = () => { setError(false); fetch('/api/flyers').then((response) => response.ok ? response.json() as Promise<Flyer[]> : Promise.reject()).then(setFlyers).catch(() => setError(true)); };
  useEffect(() => { load(); }, []);
  const rows = flyers.filter((flyer) => filter === 'all' || flyer.status === filter);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    fetch('/api/flyers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: Number(form.eventId), title: form.title, imageUrl: form.imageUrl, submittedBy: form.submittedBy }) })
      .then((response) => { if (!response.ok) throw new Error('save'); setForm({ eventId: '', title: '', imageUrl: '', submittedBy: '' }); load(); })
      .catch(() => setError(true))
      .finally(() => setPending(false));
  };
  const decide = (flyerId: number, status: 'approved' | 'rejected') => {
    fetch(`/api/flyers/${flyerId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then((response) => { if (!response.ok) throw new Error('review'); load(); }).catch(() => setError(true));
  };
  if (eventsQuery.isLoading) return <AppShell><PageHeading eyebrow="Organizer desk / Flyers" title="Approve the invitation." /><Skeleton className="h-96" /></AppShell>;
  if (eventsQuery.isError || error) return <AppShell><ErrorState onRetry={() => { void eventsQuery.refetch(); load(); }} /></AppShell>;
  return <AppShell><div className="page-in">
    <PageHeading eyebrow="Organizer desk / Flyers" title="Approve the invitation." description="Review artwork before it appears beside an ICGA program. Approved flyers become the public face of the event." />
    <div className="mb-6 flex flex-wrap gap-2">{['pending', 'approved', 'rejected', 'all'].map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${filter === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{item}</button>)}</div>
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={submit} className="rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2"><ImagePlus size={18} className="text-primary" /><h2 className="font-display text-2xl font-bold">Submit a flyer</h2></div>
        <div className="mt-5 space-y-4">
          <Field label="Event"><select required className={inputClass} value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })}><option value="">Choose an event</option>{(eventsQuery.data ?? []).map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></Field>
          <Field label="Flyer title"><input required minLength={2} className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
          <Field label="Image URL" hint="A wide poster or photo. This is what families will see."><input required minLength={8} className={inputClass} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" /></Field>
          <Field label="Submitted by"><input required minLength={2} className={inputClass} value={form.submittedBy} onChange={(event) => setForm({ ...form, submittedBy: event.target.value })} /></Field>
          <Button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send for approval'}</Button>
        </div>
      </form>
      <section className="space-y-4">{rows.length === 0 ? <EmptyState title="No flyers in this list" detail="Submit artwork, or switch the filter to see what has already been reviewed." /> : rows.map((flyer) => <article key={flyer.id} className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-xs">
        <img src={flyer.imageUrl} alt="" className="h-44 w-full object-cover" />
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-xl font-bold">{flyer.title}</h3><span className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[.12em] ${flyer.status === 'approved' ? 'bg-accent/25 text-primary' : flyer.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{flyer.status}</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{names.get(flyer.eventId) ?? `Event #${flyer.eventId}`} · {flyer.submittedBy}</p>
          {flyer.reviewNote && <p className="mt-2 text-xs italic text-muted-foreground">{flyer.reviewNote}</p>}
          {flyer.status === 'pending' && <div className="mt-4 flex gap-2"><Button onClick={() => decide(flyer.id, 'approved')}><Check size={15} /> Approve</Button><Button variant="secondary" onClick={() => decide(flyer.id, 'rejected')}><X size={15} /> Send back</Button></div>}
        </div>
      </article>)}</section>
    </div>
  </div></AppShell>;
}
