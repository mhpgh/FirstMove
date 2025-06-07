import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredAuth, setStoredAuth, type User } from "@/lib/auth";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationBell } from "@/components/notification-bell";
import { Logo } from "@/components/logo";
import AuthPage from "@/pages/auth";
import PairingPage from "@/pages/pairing";
import HomePage from "@/pages/home";
import InsightsPage from "@/pages/insights";
import SettingsPage from "@/pages/settings";

type AppState = "loading" | "auth" | "pairing" | "home" | "insights" | "settings";

function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authState = getStoredAuth();
    if (authState.isAuthenticated && authState.user) {
      setUser(authState.user);
      setAppState("home");
    } else {
      setAppState("auth");
    }
  }, []);

  // Add a dev helper to clear storage
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        localStorage.clear();
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAuthSuccess = () => {
    const authState = getStoredAuth();
    if (authState.user) {
      setUser(authState.user);
      setAppState("home");
    }
  };

  const handleNeedsPairing = () => {
    setAppState("pairing");
  };

  const handlePairingSuccess = () => {
    setAppState("home");
  };

  const handleLogout = () => {
    setUser(null);
    setStoredAuth(null);
    setAppState("auth");
  };

  const handleShowInsights = () => {
    setAppState("insights");
  };

  const handleShowSettings = () => {
    setAppState("settings");
  };

  const handleBackToHome = () => {
    setAppState("home");
  };

  if (appState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size="md" className="animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationProvider>
          <div className="min-h-screen">
            {/* Header with notification bell for authenticated pages */}
            {user && appState !== "auth" && (
              <div className="fixed top-4 right-4 z-[100] bg-white border border-gray-300 rounded-full shadow-lg pl-[2px] pr-[2px] pt-[2px] pb-[2px]">
                <NotificationBell />
              </div>
            )}

            {appState === "auth" && (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            )}
            
            {appState === "pairing" && user && (
              <PairingPage 
                user={user}
                onPairingSuccess={handlePairingSuccess}
                onLogout={handleLogout}
              />
            )}
            
            {appState === "home" && user && (
              <HomePage 
                user={user}
                onNeedsPairing={handleNeedsPairing}
                onLogout={handleLogout}
                onShowInsights={handleShowInsights}
                onShowSettings={handleShowSettings}
              />
            )}

            {appState === "insights" && user && (
              <InsightsPage 
                user={user}
                onBack={handleBackToHome}
                onShowSettings={handleShowSettings}
              />
            )}

            {appState === "settings" && user && (
              <SettingsPage 
                user={user}
                onBack={handleBackToHome}
                onNeedsPairing={handleNeedsPairing}
                onLogout={handleLogout}
                onShowInsights={handleShowInsights}
              />
            )}
          </div>
          <Toaster />
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
