import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ChildProvider } from "@/hooks/use-child";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import AddChild from "@/pages/add-child";
import Nutrition from "@/pages/nutrition";
import Vaccination from "@/pages/vaccination";
import Growth from "@/pages/growth";
import ScreenTime from "@/pages/screentime";
import Tips from "@/pages/tips";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { token } = useAuth();
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  const { token } = useAuth();
  
  return (
    <Switch>
      <Route path="/">
        {token ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/add-child"><ProtectedRoute component={AddChild} /></Route>
      <Route path="/nutrition"><ProtectedRoute component={Nutrition} /></Route>
      <Route path="/vaccination"><ProtectedRoute component={Vaccination} /></Route>
      <Route path="/growth"><ProtectedRoute component={Growth} /></Route>
      <Route path="/screentime"><ProtectedRoute component={ScreenTime} /></Route>
      <Route path="/tips"><ProtectedRoute component={Tips} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ChildProvider>
              <Router />
            </ChildProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
