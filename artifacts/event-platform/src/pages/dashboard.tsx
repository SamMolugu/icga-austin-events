import { useState } from 'react';
import { Activity, ArrowUpRight, Building2, CalendarDays, HeartHandshake, RefreshCw, Ticket, TrendingUp, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { getGetAnalyticsActivityQueryKey, getGetAnalyticsOverviewQueryKey, getListEventsQueryKey, useGetAnalyticsActivity, useGetAnalyticsOverview, useListEvents } from '@workspace/api-client-react';
import { AppShell, Button, EventCard, ErrorState, PageHeading, Skeleton, StatCard, formatDate } from '@/components/gatherly';

type Fund = { id: number; name: string; kind: string; description: string; goal: number; raised: number };
type Headcount = { id: number; title: string; category: string; startsAt: string; capacity: number; registeredCount: number; waitlisted: number; checkedIn: number; charityName: string; charityGoal: number; charityRaised: number };
type Desk = {
  upcomingEvents: number;
  totalEvents: number;
  totalRegistrations: number;
  registrationChange: number;
  totalRaised: number;
  goalProgress: number;
  averageAttendance: number;
  ticketsIssued?: number;
  ticketsCheckedIn?: number;
  waitlistedCount?: number;
  lastCalendarSync?: string | null;
  funds?: Fund[];
  headcounts?: Headcount[];
};

export default function Dashboard() {
  const overview = useGetAnalyticsOverview({ query: { queryKey: getGetAnalyticsOverviewQueryKey() } });
  const activity = useGetAnalyticsActivity({ query: { queryKey: getGetAnalyticsActivityQueryKey() } });
  const events = useListEvents({ timeframe: 'upcoming' }, { query: { queryKey: getListEventsQueryKey({ timeframe: 'upcoming' }) } });
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState('');
  const refresh = () => { void overview.refetch(); void activity.refetch(); void events.refetch(); };
  const sync = () => {
    setSyncing(true);
    fetch('/api/organizer/sync', { method: 'POST' })
      .then((response) => { if (!response.ok) throw new Error('sync'); return response.json() as Promise<{ live: number; funds: number }>; })
      .then((result) => { setNotice(`Pulled austinmosque.org — ${result.funds} funds, ${result.live} new live listings.`); refresh(); })
      .catch(() => setNotice('Could not reach the ICGA website just now. Catalog images and funds were still refreshed locally.'))
      .finally(() => setSyncing(false));
  };
  if (overview.isLoading) return <AppShell><PageHeading eyebrow="ICGA organizer desk" title="Assalamu alaikum." /><div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}</div><Skeleton className="mt-8 h-72" /></AppShell>;
  if (overview.isError || !overview.data) return <AppShell><ErrorState onRetry={refresh} /></AppShell>;
  const metrics = overview.data as Desk;
  const funds = metrics.funds ?? [];
  const headcounts = metrics.headcounts ?? [];
  return <AppShell><div className="page-in"><PageHeading eyebrow="ICGA organizer desk" title="Assalamu alaikum." description="Headcount, tickets, and the giving causes published on austinmosque.org/support-us." action={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={sync} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync ICGA site'}</Button><Button variant="secondary" onClick={refresh} data-testid="button-refresh-dashboard"><RefreshCw size={15} className={overview.isFetching ? 'animate-spin' : ''} /> Refresh</Button></div>} />
    {notice && <p className="mb-6 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-semibold text-primary">{notice}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Upcoming events" value={String(metrics.upcomingEvents)} detail={`${metrics.totalEvents} total at ICGA`} icon={CalendarDays} accent />
      <StatCard label="Tickets" value={`${metrics.ticketsCheckedIn ?? 0}/${metrics.ticketsIssued ?? metrics.totalRegistrations}`} detail={`${metrics.waitlistedCount ?? 0} waitlisted`} icon={Ticket} />
      <StatCard label="Community giving" value={`$${metrics.totalRaised.toLocaleString()}`} detail={`${Math.round(metrics.goalProgress)}% of ICGA fund goals`} icon={HeartHandshake} />
      <StatCard label="Seats filled" value={`${Math.round(metrics.averageAttendance)}%`} detail="of reserved seats across programs" icon={TrendingUp} />
    </div>
    <section className="mt-8 rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Door and seats</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">Event headcount</h2></div><UsersRound size={18} className="text-primary" /></div>
      <div className="divide-y divide-border">{headcounts.length ? headcounts.map((row) => <div key={row.id} className="grid gap-2 py-4 lg:grid-cols-[1.4fr_.8fr_.8fr] lg:items-center"><div className="min-w-0"><p className="font-semibold break-words">{row.title}</p><p className="mt-1 text-xs text-muted-foreground">{row.category} · {formatDate(row.startsAt, { month: 'short', day: 'numeric' })}</p></div><p className="text-sm text-muted-foreground">{row.registeredCount}/{row.capacity} seated · {row.checkedIn} in · {row.waitlisted} waitlist</p><p className="text-sm text-muted-foreground break-words">{row.charityName}: ${row.charityRaised.toLocaleString()} / ${row.charityGoal.toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">Headcount will appear after the calendar loads.</p>}</div>
    </section>
    <section className="mt-8 rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">austinmosque.org/support-us</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">ICGA charity and development</h2></div><Building2 size={18} className="text-primary" /></div>
      <div className="grid gap-4 md:grid-cols-2">{funds.map((fund) => {
        const fill = fund.goal ? Math.min(100, Math.round((fund.raised / fund.goal) * 100)) : 0;
        return <article key={fund.id} className="rounded-xl bg-muted/50 p-4"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{fund.kind === 'development' ? 'Development' : 'Program / sadaqah'}</p><p className="mt-1 font-semibold">{fund.name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{fund.description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-accent" style={{ width: `${fill}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">${fund.raised.toLocaleString()} of ${fund.goal.toLocaleString()}</p></article>;
      })}</div>
      {metrics.lastCalendarSync && <p className="mt-4 text-xs text-muted-foreground">Last calendar sync {formatDate(metrics.lastCalendarSync, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>}
    </section>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Next up</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">Upcoming ICGA events</h2></div><Link href="/events/manage" data-testid="link-manage-events-dashboard" className="text-xs font-bold text-primary hover:underline">Manage all</Link></div>{events.isLoading ? <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : events.data?.length ? <div className="space-y-3">{events.data.slice(0, 3).map((event) => <EventCard compact event={event} key={event.id} />)}</div> : <p className="rounded-xl bg-muted p-6 text-sm text-muted-foreground">No upcoming events yet. Your next ICGA program is waiting to be planned.</p>}</section><section className="rounded-2xl border border-card-border bg-card p-5 shadow-xs sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Live feed</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">Recent activity</h2></div><Activity size={18} className="text-primary" /></div><div className="space-y-5">{activity.isLoading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-10" />) : activity.data?.length ? activity.data.slice(0, 5).map((item) => <div key={item.id} data-testid={`activity-${item.id}`} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" /><div><p className="text-sm leading-5">{item.message}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">{formatDate(item.createdAt, { month: 'short', day: 'numeric' })}</p></div></div>) : <p className="text-sm text-muted-foreground">Your next registration or donation will appear here.</p>}</div></section></div>
    <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-secondary/75 p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="font-display text-xl font-bold">Make the next invitation easy</p><p className="mt-1 text-sm text-muted-foreground">A clear ICGA event page is the best welcome.</p></div><Link href="/events/manage" data-testid="link-create-event-dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Create an event <ArrowUpRight size={16} /></Link></section>
  </div></AppShell>;
}
