import { type ReactNode } from 'react';
import { Show, useUser } from '@clerk/react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/components/gatherly';

export function PublicShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const onCalendar = location === '/' || location.startsWith('/events/') || location.startsWith('/register/');
  const linkClass = (active: boolean) => `rounded-xl px-3 py-2 text-sm font-bold ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`;
  return <div className="min-h-[100dvh] bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        <Logo />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/" data-testid="link-public-calendar" className={linkClass(onCalendar)}>Calendar</Link>
          <Show when="signed-out">
            <Link href="/sign-in" data-testid="link-public-sign-in" className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:-translate-y-0.5">Sign in</Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" data-testid="link-public-organizer" className={linkClass(location.startsWith('/dashboard'))}>Organizer desk</Link>
            {user && <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary sm:inline">{user.firstName ?? user.emailAddresses[0]?.emailAddress ?? 'Organizer'}</span>}
          </Show>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Islamic Center of Greater Austin · 5110 Manor Rd, Austin, TX 78723</p>
        <p>(512) 926-9221 · contact@austinmosque.org</p>
      </div>
    </footer>
  </div>;
}
