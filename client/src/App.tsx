import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredAuth, setStoredAuth, type User } from "@/lib/auth";
import AuthPage from "@/pages/auth";
import PairingPage from "@/pages/pairing";
import HomePage from "@/pages/home";

type AppState = "loading" | "auth" | "pairing" | "home";

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
        <div className="min-h-screen">
          {appState === "auth" && (
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          )}
          
          {appState === "pairing" && user && (
            <PairingPage 
              user={user}
              onPairingSuccess={handlePairingSuccess} 
            />
          )}
          
          {appState === "home" && user && (
            <HomePage 
              user={user}
              onNeedsPairing={handleNeedsPairing}
              onLogout={handleLogout}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
