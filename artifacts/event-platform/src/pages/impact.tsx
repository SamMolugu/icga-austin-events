import { useEffect, useState } from 'react';
import { Building2, HeartHandshake, Ticket, UsersRound } from 'lucide-react';
import { ErrorState, PageHeading, Skeleton, StatCard } from '@/components/gatherly';
import { PublicShell } from '@/components/public-shell';

type Fund = { id: number; name: string; kind: string; description: string; goal: number; raised: number };
type Gift = { amount: number; fundName: string; createdAt: string };
type ImpactData = { totalRaised: number; programRaised: number; developmentRaised: number; ticketsIssued: number; ticketsCheckedIn: number; upcomingEvents: number; funds: Fund[]; recentGifts: Gift[] };

export default function Impact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [error, setError] = useState(false);
  const load = () => { setError(false); fetch('/api/impact').then((response) => response.ok ? response.json() as Promise<ImpactData> : Promise.reject()).then(setData).catch(() => setError(true)); };
  useEffect(() => { load(); }, []);
  if (!data && !error) return <PublicShell><PageHeading eyebrow="Community impact" title="What the ummah is building." /><div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}</div></PublicShell>;
  if (error || !data) return <PublicShell><ErrorState onRetry={load} /></PublicShell>;
  return <PublicShell><div className="page-in">
    <PageHeading eyebrow="Community impact" title="What the ummah is building." description="Giving, tickets, and campus development — kept in the open so the ICGA community can see the work." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard accent label="Total recorded" value={`$${data.totalRaised.toLocaleString()}`} detail="programs and development together" icon={HeartHandshake} />
      <StatCard label="Program giving" value={`$${data.programRaised.toLocaleString()}`} detail="classes, scholarships, and hospitality" icon={UsersRound} />
      <StatCard label="Development" value={`$${data.developmentRaised.toLocaleString()}`} detail="facility and education expansion" icon={Building2} />
      <StatCard label="Tickets" value={`${data.ticketsCheckedIn}/${data.ticketsIssued}`} detail={`${data.upcomingEvents} upcoming programs`} icon={Ticket} />
    </div>
    <section className="mt-10 grid gap-4 lg:grid-cols-2">{data.funds.map((fund) => {
      const fill = fund.goal ? Math.min(100, Math.round((fund.raised / fund.goal) * 100)) : 0;
      return <article key={fund.id} className="rounded-2xl border border-card-border bg-card/90 p-5 shadow-xs sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{fund.kind === 'development' ? 'Development' : 'Program fund'}</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-[-.04em]">{fund.name}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{fund.description}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${fill}%` }} /></div>
        <p className="mt-2 text-xs text-muted-foreground">${fund.raised.toLocaleString()} of ${fund.goal.toLocaleString()} · {fill}%</p>
      </article>;
    })}</section>
    <section className="mt-10 rounded-2xl border border-card-border bg-card/90 p-5 shadow-xs sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Recent support</p>
      <h2 className="mt-2 font-display text-2xl font-bold">Gifts the community can see</h2>
      <div className="mt-5 divide-y divide-border">{data.recentGifts.length ? data.recentGifts.map((gift, index) => <div key={`${gift.createdAt}-${index}`} className="flex items-center justify-between gap-4 py-3"><p className="text-sm text-muted-foreground">{gift.fundName}</p><p className="font-display text-xl font-bold text-primary">+${gift.amount.toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">The next gift will appear here.</p>}</div>
    </section>
  </div></PublicShell>;
}
