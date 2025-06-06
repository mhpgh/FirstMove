import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Home, BarChart3, Settings, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MatchModal } from "@/components/match-modal";
import { ConnectionStatus } from "@/components/connection-status";
import { Logo } from "@/components/logo";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, logoutUser } from "@/lib/auth";

interface Partner {
  id: number;
  username: string;
  displayName: string;
  keepTrack: boolean;
  createdAt: string;
}

interface Couple {
  id: number;
  user1Id: number;
  user2Id: number;
  isActive: boolean;
  createdAt: string;
}

interface CoupleData {
  couple: Couple;
  partner: Partner;
}

interface Match {
  id: number;
  coupleId: number;
  matchedAt: string;
  acknowledged: boolean;
  connected: boolean;
  connectedAt: string | null;
  recorded: boolean;
}

// Single mood option as per requirements

interface HomePageProps {
  user: User;
  onNeedsPairing: () => void;
  onLogout: () => void;
  onShowInsights: () => void;
}

export default function HomePage({ user, onNeedsPairing, onLogout, onShowInsights }: HomePageProps) {
  const [isInMood, setIsInMood] = useState<boolean>(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);
  const [nudgeDays, setNudgeDays] = useState<number>(7);
  const [nudgeEnabled, setNudgeEnabled] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("60");
  const [showConnectedAnimation, setShowConnectedAnimation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(user);

  // Fetch couple data
  const { data: coupleData, isLoading: isLoadingCouple } = useQuery<CoupleData>({
    queryKey: [`/api/user/${user.id}/couple`],
    retry: false,
  });

  // Fetch recent matches
  const { data: matchesData } = useQuery<{ matches: Match[] }>({
    queryKey: [`/api/couple/${coupleData?.couple.id}/matches`],
    enabled: !!coupleData?.couple.id,
  });

  // Fetch active mood for current user
  const { data: activeMoodData } = useQuery<{ moods: any[] }>({
    queryKey: [`/api/user/${user.id}/moods`],
    enabled: !!user.id,
  });



  // Set "in the mood" mutation
  const setInMoodMutation = useMutation({
    mutationFn: async () => {
      const duration = parseInt(selectedDuration);
      const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      const response = await apiRequest("POST", "/api/mood", {
        userId: user.id,
        duration: duration,
        expiresAt: expiresAt,
      });
      return response.json();
    },
    onSuccess: () => {
      // Set mood state immediately - WebSocket will override if there's a match
      setIsInMood(true);
      
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: [`/api/user/${user.id}/moods`],
      });
      
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Cancel mood mutation
  const cancelMoodMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/user/${user.id}/moods/deactivate`);
      return response;
    },
    onSuccess: () => {
      // Clear all local state
      setIsInMood(false);
      setShowConnectionPanel(false);
      setCurrentMatch(null);
      setShowMatchModal(false);
      
      queryClient.invalidateQueries({
        queryKey: [`/api/user/${user.id}/moods`],
      });
      
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
      }
      
      toast({
        title: "Cancelled",
        description: "Your mood has been cancelled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel mood",
        variant: "destructive",
      });
    },
  });

  // Connect match mutation
  const connectMatchMutation = useMutation({
    mutationFn: async (matchId: number) => {
      const response = await apiRequest("PUT", `/api/match/${matchId}/connect`, {});
      return response.json();
    },
    onSuccess: (result) => {
      // Clear connection state immediately
      setShowConnectionPanel(false);
      setCurrentMatch(null);
      setIsInMood(false);
      
      // Show the connected animation
      setShowConnectedAnimation(true);
      
      // Show appropriate toast message (only if not already connected)
      if (!result.alreadyConnected) {
        if (result.recorded) {
          toast({
            title: "Connection logged",
            description: "Your intimate moment has been recorded",
          });
        } else {
          toast({
            title: "Connection confirmed",
            description: "Both users need to enable 'Keep Track' to record history",
          });
        }
      }
      
      // Reset to original state after animation
      setTimeout(() => {
        setShowConnectedAnimation(false);
        setShowConnectionPanel(false);
        setCurrentMatch(null);
      }, 2000);

      // Refresh matches data and mood data
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
      }
      
      // Invalidate mood data to properly reset the UI state
      queryClient.invalidateQueries({
        queryKey: [`/api/user/${user.id}/moods`],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect",
        variant: "destructive",
      });
    },
  });



  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "match") {
      console.log('Received match WebSocket message:', lastMessage);
      // Immediately clear waiting state and show match
      setIsInMood(false);
      setCurrentMatch({
        id: lastMessage.matchId,
        coupleId: lastMessage.coupleId || coupleData?.couple.id || 0,
        matchedAt: lastMessage.matchedAt,
        acknowledged: false,
        connected: false,
        connectedAt: null,
        recorded: false
      });
      setShowMatchModal(true);
      setShowConnectionPanel(true);
      // Refresh matches data
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
      }
    } else if (lastMessage?.type === "connection") {
      console.log('Received connection WebSocket message:', lastMessage);
      // Immediately clear all connection-related state
      setShowConnectionPanel(false);
      setShowMatchModal(false);
      setCurrentMatch(null);
      
      // Show connection animation
      setShowConnectedAnimation(true);
      
      // Hide animation after 2 seconds and ensure clean state
      setTimeout(() => {
        setShowConnectedAnimation(false);
        // Reset to clean "In the Mood" state after animation
        setIsInMood(false);
      }, 2000);
      
      // Refresh data immediately to sync with server state
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
        queryClient.invalidateQueries({
          queryKey: [`/api/user/${user.id}/moods`],
        });
      }
      
      // Force refresh mood data after a short delay to ensure server has processed deactivation
      setTimeout(() => {
        if (coupleData?.couple.id) {
          queryClient.invalidateQueries({
            queryKey: [`/api/user/${user.id}/moods`],
          });
        }
      }, 500);
    }
  }, [lastMessage, coupleData, queryClient, user.id]);

  // Check for new matches after setting mood (fallback if WebSocket fails)
  useEffect(() => {
    if (isInMood && matchesData?.matches && coupleData?.couple.id && !showMatchModal && !showConnectedAnimation) {
      const recentMatch = matchesData.matches.find(match => 
        !match.connected && 
        new Date(match.matchedAt).getTime() > Date.now() - 2 * 60 * 1000 && // Within last 2 minutes
        !currentMatch // Only if we don't already have a current match
      );
      
      if (recentMatch) {
        console.log('Found recent match via polling:', recentMatch);
        setCurrentMatch(recentMatch);
        setShowMatchModal(true);
        setShowConnectionPanel(true);
      }
    }
  }, [matchesData, isInMood, currentMatch, coupleData, showMatchModal, showConnectedAnimation]);

  // Check if user needs pairing
  useEffect(() => {
    if (!isLoadingCouple && !coupleData) {
      onNeedsPairing();
    }
  }, [isLoadingCouple, coupleData, onNeedsPairing]);

  // Initialize mood state from backend data on first load only
  useEffect(() => {
    if (activeMoodData?.moods && activeMoodData.moods.length > 0 && !isInMood) {
      setIsInMood(true);
    }
  }, [activeMoodData?.moods, isInMood]);

  // Check for unconnected matches only when we receive a WebSocket match notification
  // Don't automatically show connection panel based on historical matches
  useEffect(() => {
    // Only reset connection panel if user manually cancelled (not when match was found)
    if (!isInMood && showConnectionPanel && !currentMatch) {
      setShowConnectionPanel(false);
    }
  }, [isInMood, showConnectionPanel, currentMatch]);

  const handleInMoodPress = () => {
    setInMoodMutation.mutate();
  };

  const handleCancelMood = () => {
    cancelMoodMutation.mutate();
  };

  const handleResetMood = () => {
    setInMoodMutation.mutate();
  };

  const handleConnectionConfirmed = () => {
    console.log('Connection button clicked, currentMatch:', currentMatch);
    if (currentMatch) {
      console.log('Calling connectMatchMutation with ID:', currentMatch.id);
      connectMatchMutation.mutate(currentMatch.id);
    } else {
      console.log('No currentMatch available');
      toast({
        title: "Error",
        description: "No match found to connect",
        variant: "destructive",
      });
    }
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    // Don't clear currentMatch - keep it for the connection panel
    // setCurrentMatch(null);
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };



  if (isLoadingCouple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 gradient-bg rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!coupleData) {
    return null; // Will redirect to pairing
  }

  const recentMatches = matchesData?.matches?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <span className="text-xl font-semibold text-gray-800">Hintly</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="text-gray-400 text-lg" />
              {recentMatches.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center notification-badge">
                  {recentMatches.length}
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center"
            >
              <span className="text-sm font-medium text-gray-600">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20 px-4 max-w-md mx-auto">
        {/* Connection Status */}
        <ConnectionStatus 
          partner={coupleData.partner} 
          isConnected={isConnected} 
        />

        {/* In the Mood or Connection Panel */}
        {showConnectionPanel ? (
          <Card className="rounded-2xl shadow-sm mb-6 animate-slide-up">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">It's Time!</h3>
              <p className="text-gray-500 text-sm mb-6">
                You both indicated you're in the mood{currentMatch && activeMoodData?.moods?.[0]?.expiresAt && ` until ${new Date(Math.min(new Date(activeMoodData.moods[0].expiresAt).getTime(), new Date(currentMatch.matchedAt).getTime() + 60 * 60 * 1000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
              </p>
              
              <Button
                onClick={handleConnectionConfirmed}
                disabled={connectMatchMutation.isPending}
                className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
              >
                {connectMatchMutation.isPending ? "Connecting..." : "We Connected"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-sm mb-6 animate-slide-up">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How are you feeling?</h3>
              
              {isInMood ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700 mb-2">
                      You're in the mood{activeMoodData?.moods?.[0]?.expiresAt && ` until ${new Date(activeMoodData.moods[0].expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </p>
                    <p className="text-xs text-blue-600">Waiting for your partner to feel the same way...</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      How long will you be in the mood?
                    </label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleResetMood}
                      disabled={setInMoodMutation.isPending}
                      className="flex-1 gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {setInMoodMutation.isPending ? "Resetting..." : "Reset"}
                    </Button>
                    <Button
                      onClick={handleCancelMood}
                      variant="outline"
                      className="flex-1 py-3 rounded-xl font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      How long will you be in the mood?
                    </label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleInMoodPress}
                    disabled={setInMoodMutation.isPending}
                    className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {setInMoodMutation.isPending ? "Setting mood..." : "In the Mood"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nudge Me Panel */}
        <Card className="rounded-2xl shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Nudge Me</h3>
              <Switch 
                checked={nudgeEnabled} 
                onCheckedChange={setNudgeEnabled}
              />
            </div>
            
            {nudgeEnabled && (
              <>
                <p className="text-gray-500 text-sm mb-4">How many days without a connection before we remind you?</p>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={nudgeDays}
                    onChange={(e) => setNudgeDays(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center"
                  />
                  <span className="text-gray-600">days</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>


      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center py-2 px-3 text-primary">
              <Home className="text-lg mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button 
              onClick={onShowInsights}
              className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary"
            >
              <BarChart3 className="text-lg mb-1" />
              <span className="text-xs">Insights</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-400">
              <Settings className="text-lg mb-1" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Match Modal */}
      {showMatchModal && currentMatch && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={handleMatchModalClose}
          partnerName={coupleData.partner.displayName}
          moodType="intimate"
          onStartConversation={handleMatchModalClose}
        />
      )}

      {/* Connected Animation Overlay */}
      {showConnectedAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fade-in">
          <div className="animate-bounce-fade">
            <Logo size="lg" className="opacity-90" />
          </div>
        </div>
      )}

    </div>
  );
}
