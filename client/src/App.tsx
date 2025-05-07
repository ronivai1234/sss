import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import DailyView from "@/pages/daily-view";
import MonthlyReport from "@/pages/monthly-report";
import Admin from "@/pages/admin";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/lib/theme-provider";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar currentPage={location} />
      <div className="lg:pl-64 flex flex-col w-full">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/daily" component={DailyView} />
          <Route path="/monthly" component={MonthlyReport} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
        <MobileNav currentPage={location} />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="dailybooks-theme">
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
