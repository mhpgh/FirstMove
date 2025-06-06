import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredAuth, setStoredAuth, type User } from "@/lib/auth";
import { NotificationProvider } from "@/contexts/notification-context";
import { NotificationBell } from "@/components/notification-bell";
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
          <div className="w-8 h-8 gradient-bg rounded-full animate-spin mx-auto mb-4"></div>
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
              <div className="fixed top-0 right-0 z-50 p-4">
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
