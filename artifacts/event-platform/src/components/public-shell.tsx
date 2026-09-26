import { type ReactNode } from 'react';
import { Show, useUser } from '@clerk/react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/components/gatherly';

export function PublicShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const onCalendar = location === '/' || location.startsWith('/events/') || location.startsWith('/register/');
  const linkClass = (active: boolean) => `shrink-0 rounded-xl px-2 py-1.5 text-xs font-bold sm:px-3 sm:py-2 sm:text-sm ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`;
  return <div className="min-h-[100dvh] bg-transparent text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-3.5 lg:px-12">
        <Logo />
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain sm:justify-end sm:gap-2">
          <Link href="/" data-testid="link-public-calendar" className={linkClass(onCalendar)}>Calendar</Link>
          <Link href="/impact" data-testid="link-public-impact" className={linkClass(location === '/impact')}>Impact</Link>
          {(!clerkEnabled || user) && <Link href="/dashboard" data-testid="link-public-organizer" className={linkClass(location.startsWith('/dashboard'))}><span className="sm:hidden">Desk</span><span className="hidden sm:inline">Organizer desk</span></Link>}
          {clerkEnabled && <Show when="signed-out"><Link href="/sign-in" data-testid="link-public-sign-in" className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:-translate-y-0.5 sm:text-sm">Sign in</Link></Show>}
          {user && <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary md:inline">{user.firstName ?? user.emailAddresses[0]?.emailAddress ?? 'Organizer'}</span>}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-7 lg:px-12 lg:py-10">{children}</main>
    <footer className="border-t border-border/80 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Islamic Center of Greater Austin · 5110 Manor Rd, Austin, TX 78723</p>
        <p>(512) 926-9221 · contact@austinmosque.org</p>
      </div>
    </footer>
  </div>;
}
