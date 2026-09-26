import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CalendarDays, ChevronRight, Compass, HeartHandshake, ImagePlus, LayoutDashboard, ListChecks, MailCheck, Menu, Megaphone, Settings2, Sparkles, X } from 'lucide-react';
import type { Event } from '@workspace/api-client-react';

const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export function Logo() {
  return <Link href="/" data-testid="link-logo" className="flex shrink-0 items-center gap-2 text-inherit sm:gap-2.5">
    <span className="grid size-8 place-items-center rounded-[11px] bg-primary text-accent shadow-sm sm:size-9"><Sparkles size={16} strokeWidth={2.5} /></span>
    <span className="font-display text-[18px] font-bold tracking-[-.04em] sm:text-[20px]">ICGA<span className="text-accent">.</span></span>
  </Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/events/manage', label: 'My events', icon: ListChecks },
    { href: '/donations', label: 'Giving', icon: HeartHandshake },
    { href: '/marketing', label: 'Marketing', icon: Megaphone },
    { href: '/registrations', label: 'Tickets', icon: MailCheck },
    { href: '/flyers', label: 'Flyers', icon: ImagePlus },
    { href: '/settings/notifications', label: 'Preferences', icon: Settings2 },
  ];
  return <div className="min-h-[100dvh] bg-transparent text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground lg:flex">
      <Logo />
      <div className="mt-12">
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/50">ICGA organizer desk</p>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${location === href ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
            <Icon size={17} /> {label}
          </Link>)}
        </nav>
      </div>
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4">
        <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.15em] text-sidebar-foreground/50">This month</span><HeartHandshake size={16} className="text-sidebar-primary" /></div>
        <p className="font-display text-lg font-semibold">Serving the ummah.</p>
        <p className="mt-1 text-xs leading-5 text-sidebar-foreground/60">Programs made easy, community impact made visible.</p>
      </div>
    </aside>
    <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-border/80 bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur sm:h-[70px] sm:px-5 lg:hidden">
      <Logo />
      <button type="button" aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-muted"><Menu size={20} /></button>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[280px] bg-sidebar p-5 text-sidebar-foreground" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Logo /><button type="button" data-testid="button-close-navigation" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent"><X size={19} /></button></div><nav className="mt-12 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} data-testid={`link-mobile-nav-${label.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/75 hover:bg-sidebar-accent"><Icon size={17} />{label}</Link>)}</nav></div></div>}
    <main className="lg:pl-[246px]"><div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-7 lg:px-12 lg:py-10">{children}</div></main>
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div className="min-w-0"><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">{eyebrow ?? 'ICGA Austin'}</p><h1 className="font-display text-[1.75rem] font-bold tracking-[-.055em] text-balance break-words text-foreground sm:text-4xl lg:text-[46px]">{title}</h1>{description && <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">{description}</p>}</div>
    {action}
  </div>;
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'warm' }) {
  const variants = { primary: 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-md', secondary: 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted', ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground', warm: 'bg-accent text-accent-foreground hover:-translate-y-0.5 hover:shadow-md' };
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${variants[variant]} ${className}`}>{children}</button>;
}

export function StatCard({ label, value, detail, icon: Icon, accent = false }: { label: string; value: string; detail?: string; icon: typeof CalendarDays; accent?: boolean }) {
  return <div className={`rounded-2xl border p-5 shadow-xs ${accent ? 'border-primary bg-primary text-primary-foreground' : 'border-card-border bg-card'}`}><div className="flex items-start justify-between"><p className={`font-mono text-[10px] uppercase tracking-[.16em] ${accent ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{label}</p><Icon size={18} className={accent ? 'text-accent' : 'text-primary'} /></div><p className="mt-5 font-display text-3xl font-bold tracking-[-.05em]">{value}</p>{detail && <p className={`mt-1 text-xs ${accent ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}>{detail}</p>}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`skeleton-shimmer rounded-xl ${className}`} />; }
export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"><div className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-secondary text-primary"><Compass size={19} /></div><h3 className="font-display text-xl font-bold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center"><p className="font-display text-xl font-bold">We hit a small snag.</p><p className="mt-2 text-sm text-muted-foreground">Your community is still here. Try loading this again.</p><Button onClick={onRetry} variant="secondary" className="mt-5">Try again</Button></div>; }

export function EventCard({ event, compact = false }: { event: Event; compact?: boolean }) {
  const fill = event.capacity ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;
  return <Link href={`/events/${event.id}`} data-testid={`card-event-${event.id}`} className={`group block overflow-hidden rounded-2xl border border-card-border bg-card shadow-xs hover:-translate-y-1 hover:shadow-md ${compact ? 'grid grid-cols-1 min-[420px]:grid-cols-[116px_1fr] sm:grid-cols-[150px_1fr]' : ''}`}>
    <div className={`relative overflow-hidden ${compact ? 'aspect-[16/9] min-h-[120px] min-[420px]:aspect-auto min-[420px]:min-h-[138px]' : 'aspect-[1.65/1]'}`} style={{ background: `linear-gradient(135deg, hsl(${(event.id * 43) % 360} 42% 34%), hsl(${((event.id * 43) + 55) % 360} 50% 70%))` }}>
      {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 p-4 text-right font-display text-5xl font-bold text-white/20">{String(event.title).slice(0, 1)}</div>}
      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-foreground">{event.category}</span>
    </div>
    <div className="p-4 sm:p-5"><div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground"><CalendarDays size={12} className="text-primary" />{formatDate(event.startsAt, { weekday: 'short', month: 'short', day: 'numeric' })}</div><h3 className="font-display text-xl font-bold leading-tight tracking-[-.035em] group-hover:text-primary">{event.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{event.description}</p><div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs"><span className="truncate text-muted-foreground">{event.location}</span><span className="flex items-center gap-1 font-bold text-primary">{Math.max(0, event.capacity - event.registeredCount)} seats <ChevronRight size={13} /></span></div>{!compact && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${fill}%` }} /></div>}</div>
  </Link>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="block"><span className="mb-2 block text-xs font-bold text-foreground">{label}</span>{children}{hint && <span className="mt-1.5 block text-[11px] text-muted-foreground">{hint}</span>}</label>; }
export const inputClass = 'w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/20';
export { formatDate };