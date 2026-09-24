import { useEffect, useState } from 'react';
import { Bell, CalendarClock, Check, Mail, RefreshCw, UsersRound } from 'lucide-react';
import { getGetNotificationPreferencesQueryKey, useGetNotificationPreferences, useUpdateNotificationPreferences } from '@workspace/api-client-react';
import { AppShell, Button, ErrorState, PageHeading, Skeleton } from '@/components/gatherly';

const options = [
  { key: 'emailReminders', title: 'Event reminders', detail: 'A gentle nudge before each upcoming gathering.', icon: CalendarClock },
  { key: 'registrationAlerts', title: 'Registration alerts', detail: 'Know when a new neighbor saves a seat.', icon: UsersRound },
  { key: 'donationUpdates', title: 'Giving updates', detail: 'A clear note when support lands in your ledger.', icon: Bell },
  { key: 'weeklyDigest', title: 'Weekly digest', detail: 'A short look at your events, people, and impact.', icon: Mail },
] as const;
type Preferences = Record<(typeof options)[number]['key'], boolean>;

export default function Notifications() {
  const query = useGetNotificationPreferences({ query: { queryKey: getGetNotificationPreferencesQueryKey() } });
  const update = useUpdateNotificationPreferences();
  const [preferences, setPreferences] = useState<Preferences>({ emailReminders: true, registrationAlerts: true, donationUpdates: true, weeklyDigest: false });
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (query.data) setPreferences(query.data); }, [query.data]);
  const toggle = (key: keyof Preferences) => { const next = { ...preferences, [key]: !preferences[key] }; setPreferences(next); setSaved(false); update.mutate({ data: { [key]: next[key] } }, { onSuccess: () => setSaved(true) }); };
  if (query.isLoading) return <AppShell><PageHeading eyebrow="Settings" title="Stay in the loop." /><Skeleton className="h-96" /></AppShell>;
  if (query.isError) return <AppShell><ErrorState onRetry={() => query.refetch()} /></AppShell>;
  return <AppShell><div className="page-in max-w-3xl"><PageHeading eyebrow="Settings / Notifications" title="Stay in the loop." description="Choose the useful notes. We’ll keep the noise out." action={<Button variant="secondary" onClick={() => query.refetch()} data-testid="button-refresh-preferences"><RefreshCw size={15} /> Refresh</Button>} /><div className="rounded-2xl border border-card-border bg-card shadow-xs">{options.map(({ key, title, detail, icon: Icon }, index) => <div key={key} className={`flex items-center justify-between gap-5 p-5 sm:p-6 ${index < options.length - 1 ? 'border-b border-border' : ''}`}><div className="flex items-start gap-4"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon size={18} /></div><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">{detail}</p></div></div><button type="button" role="switch" aria-checked={preferences[key]} data-testid={`switch-${key}`} onClick={() => toggle(key)} className={`relative h-7 w-12 shrink-0 rounded-full p-1 ${preferences[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}><span className={`block size-5 rounded-full bg-card shadow-sm transition-transform ${preferences[key] ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>)}</div>{saved && <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-semibold text-primary" data-testid="status-preferences-saved"><Check size={16} /> Preferences saved</div>}<p className="mt-6 text-xs leading-5 text-muted-foreground">You can change these at any time. Gatherly only sends messages about the events and impact you’ve chosen to follow.</p></div></AppShell>;
}