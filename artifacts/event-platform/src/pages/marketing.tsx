import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Megaphone, Plus, Trash2 } from 'lucide-react';
import { getListEventsQueryKey, useListEvents } from '@workspace/api-client-react';
import { AppShell, Button, EmptyState, ErrorState, Field, PageHeading, Skeleton, inputClass } from '@/components/gatherly';

type Plan = { id: number; eventId: number; channel: string; status: string; publishAt: string | null; copy: string; ownerName: string | null };
const channels = ['Email', 'Instagram', 'Facebook', 'WhatsApp', 'Website'];

export default function Marketing() {
  const eventsQuery = useListEvents(undefined, { query: { queryKey: getListEventsQueryKey() } });
  const events = eventsQuery.data ?? [];
  const [eventId, setEventId] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ channel: 'Email', status: 'planned', publishAt: '', copy: '', ownerName: '' });
  const [notice, setNotice] = useState('');
  const selectedEvent = useMemo(() => events.find((event) => String(event.id) === eventId), [events, eventId]);

  const load = async () => {
    if (!eventId) { setPlans([]); return; }
    const response = await fetch(`/api/marketing/plans?eventId=${eventId}`);
    if (response.ok) setPlans(await response.json() as Plan[]);
  };
  useEffect(() => { if (!eventId && events[0]) setEventId(String(events[0].id)); }, [events, eventId]);
  useEffect(() => { void load(); }, [eventId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!eventId) return;
    const response = await fetch('/api/marketing/plans', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, eventId: Number(eventId), publishAt: form.publishAt || null }) });
    if (response.ok) {
      setForm({ channel: 'Email', status: 'planned', publishAt: '', copy: '', ownerName: '' });
      setNotice('Marketing item added to the plan.');
      void load();
    }
  };
  const remove = async (id: number) => {
    await fetch(`/api/marketing/plans/${id}`, { method: 'DELETE' });
    void load();
  };

  if (eventsQuery.isLoading) return <AppShell><PageHeading eyebrow="ICGA organizer desk / Marketing" title="Plan the invitation." /><Skeleton className="h-96" /></AppShell>;
  if (eventsQuery.isError) return <AppShell><ErrorState onRetry={() => eventsQuery.refetch()} /></AppShell>;
  return <AppShell><div className="page-in"><PageHeading eyebrow="ICGA organizer desk / Marketing" title="Plan the invitation." description="Keep every email, social post, and community reminder connected to the event it supports." />
    <div className="mb-6 rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6"><Field label="Plan for event"><select className={inputClass} value={eventId} onChange={(event) => setEventId(event.target.value)}>{events.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>{selectedEvent && <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-primary" />{new Date(selectedEvent.startsAt).toLocaleString()}</span><span>{selectedEvent.registeredCount}/{selectedEvent.capacity} seats reserved</span></div>}</div>
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><form onSubmit={submit} className="rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6"><div className="flex items-center gap-2"><Megaphone size={18} className="text-primary" /><h2 className="font-display text-2xl font-bold">Add a touchpoint</h2></div><div className="mt-5 space-y-4"><Field label="Channel"><select className={inputClass} value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></Field><Field label="Status"><select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="planned">Planned</option><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Publish date"><input type="datetime-local" className={inputClass} value={form.publishAt} onChange={(event) => setForm({ ...form, publishAt: event.target.value })} /></Field><Field label="Owner"><input className={inputClass} placeholder="e.g. Aisha" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} /></Field><Field label="Message or copy"><textarea required minLength={2} className={`${inputClass} min-h-28 resize-y`} placeholder="What should the community know?" value={form.copy} onChange={(event) => setForm({ ...form, copy: event.target.value })} /></Field><Button type="submit"><Plus size={15} /> Add to plan</Button>{notice && <p className="flex items-center gap-2 text-xs font-semibold text-primary"><Check size={14} />{notice}</p>}</div></form>
      <section className="rounded-2xl border border-card-border bg-card shadow-xs"><div className="border-b border-border p-5 sm:p-6"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Campaign board</p><h2 className="mt-1 font-display text-2xl font-bold">Upcoming touchpoints</h2></div>{plans.length === 0 ? <div className="p-5"><EmptyState title="No touchpoints yet" detail="Add the first invitation, reminder, or follow-up for this ICGA event." /></div> : <div className="divide-y divide-border">{plans.map((plan) => <div key={plan.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">{plan.channel}</span><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{plan.status}</span></div><p className="mt-3 text-sm leading-6">{plan.copy}</p><p className="mt-2 text-xs text-muted-foreground">{plan.publishAt ? new Date(plan.publishAt).toLocaleString() : 'No publish date'}{plan.ownerName ? ` · ${plan.ownerName}` : ''}</p></div><button type="button" aria-label="Delete marketing item" className="self-end rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:self-start" onClick={() => remove(plan.id)}><Trash2 size={16} /></button></div>)}</div>}</section></div>
  </div></AppShell>;
}