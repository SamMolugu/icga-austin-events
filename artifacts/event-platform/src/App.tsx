import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, RedirectToSignIn, Show, SignIn, SignUp, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import EventDetail from '@/pages/event-detail';
import RegistrationConfirmation from '@/pages/registration';
import Dashboard from '@/pages/dashboard';
import ManageEvents from '@/pages/manage-events';
import Donations from '@/pages/donations';
import Notifications from '@/pages/notifications';
import Marketing from '@/pages/marketing';
import Registrations from '@/pages/registrations';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function AdminRoute({ children }: { children: ReactNode }) {
  return <><Show when="signed-in">{children}</Show><Show when="signed-out"><RedirectToSignIn /></Show></>;
}

function AccountBadge() {
  const { user } = useUser();
  if (!user) return null;
  return <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{user.firstName ?? user.emailAddresses[0]?.emailAddress ?? 'Demo admin'}</span>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
         <Route path="/" component={Home} />
         <Route path="/events/manage" component={() => <AdminRoute><ManageEvents /></AdminRoute>} />
         <Route path="/events/:eventId" component={EventDetail} />
         <Route path="/register/:registrationId" component={RegistrationConfirmation} />
         <Route path="/dashboard" component={() => <AdminRoute><Dashboard /></AdminRoute>} />
         <Route path="/donations" component={() => <AdminRoute><Donations /></AdminRoute>} />
         <Route path="/registrations" component={() => <AdminRoute><Registrations /></AdminRoute>} />
         <Route path="/marketing" component={() => <AdminRoute><Marketing /></AdminRoute>} />
         <Route path="/settings/notifications" component={() => <AdminRoute><Notifications /></AdminRoute>} />
         <Route path="/sign-in/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>} />
         <Route path="/sign-up/*?" component={() => <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={{ theme: shadcn, options: { logoImageUrl: `${window.location.origin}${basePath}/logo.svg`, logoLinkUrl: basePath || '/' }, variables: { colorPrimary: '#24574E', colorForeground: '#243234', colorBackground: '#FFFCF6', colorInput: '#FFFFFF', colorInputForeground: '#243234', colorMutedForeground: '#687775', colorNeutral: '#D9E0D9', borderRadius: '0.75rem', fontFamily: 'Inter, sans-serif' }, elements: { cardBox: 'bg-white rounded-2xl w-[440px] max-w-full', card: '!shadow-none !border-0 !bg-transparent', footer: '!shadow-none !border-0 !bg-transparent', formButtonPrimary: 'bg-[#24574E] hover:bg-[#1D473F]', headerTitle: 'text-[#24574E]', headerSubtitle: 'text-[#687775]', formFieldLabel: 'text-[#243234]', footerActionLink: 'text-[#24574E]', footerActionText: 'text-[#687775]' } }} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
