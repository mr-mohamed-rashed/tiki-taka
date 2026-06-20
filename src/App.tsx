import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { LanguageProvider } from "./context/LanguageContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { AppErrorBoundary } from "./components/one2/AppErrorBoundary";
import { PwaInstallPrompt } from "./components/one2/PwaInstallPrompt";
import { useEffect } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => {
  const router = createBrowserRouter(routers);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refetch queries when returning to the app to get latest updates
        queryClient.invalidateQueries();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <SiteSettingsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <RouterProvider router={router} />
                <PwaInstallPrompt />
              </TooltipProvider>
            </SiteSettingsProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
