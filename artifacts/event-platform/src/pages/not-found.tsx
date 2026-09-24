import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';
import { Logo } from '@/components/gatherly';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center"><Logo /></div>
        <div className="mx-auto mt-16 grid size-16 place-items-center rounded-full bg-secondary text-primary"><Compass size={28} /></div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">A quiet corner</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.06em]">This room isn’t here.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The page you were looking for may have moved. The bulletin is still just one step away.</p>
        <Link href="/" data-testid="link-back-from-404" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"><ArrowLeft size={16} /> Back to ICGA</Link>
      </div>
    </div>
  );
}
