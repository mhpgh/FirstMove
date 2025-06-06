import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Home, BarChart3, Settings, Heart, Clock } from "lucide-react";
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
  moodType: string;
  matchedAt: string;
  acknowledged: boolean;
}

// Single mood option as per requirements

interface HomePageProps {
  user: User;
  onNeedsPairing: () => void;
  onLogout: () => void;
}

export default function HomePage({ user, onNeedsPairing, onLogout }: HomePageProps) {
  const [isInMood, setIsInMood] = useState<boolean>(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);
  const [nudgeDays, setNudgeDays] = useState<number>(7);
  const [nudgeEnabled, setNudgeEnabled] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("60");
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

  // Set "in the mood" mutation
  const setInMoodMutation = useMutation({
    mutationFn: async () => {
      const duration = parseInt(selectedDuration);
      const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      const response = await apiRequest("POST", "/api/mood", {
        userId: user.id,
        moodType: "intimate",
        duration: duration,
        expiresAt: expiresAt,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsInMood(true);
      toast({
        title: "Got it!",
        description: "We'll let you know when your partner feels the same way",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "match") {
      setCurrentMatch({
        id: lastMessage.matchId,
        coupleId: lastMessage.coupleId || coupleData?.couple.id || 0,
        moodType: lastMessage.moodType,
        matchedAt: lastMessage.matchedAt,
        acknowledged: false
      });
      setShowMatchModal(true);
      setShowConnectionPanel(true);
      // Refresh matches data
      if (coupleData?.couple.id) {
        queryClient.invalidateQueries({
          queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
        });
      }
    }
  }, [lastMessage, coupleData, queryClient]);

  // Check if user needs pairing
  useEffect(() => {
    if (!isLoadingCouple && !coupleData) {
      onNeedsPairing();
    }
  }, [isLoadingCouple, coupleData, onNeedsPairing]);

  const handleInMoodPress = () => {
    setInMoodMutation.mutate();
  };

  const handleConnectionConfirmed = async () => {
    if (currentMatch) {
      try {
        await apiRequest("POST", `/api/match/${currentMatch.id}/connect`, {});
        setShowConnectionPanel(false);
        setIsInMood(false);
        // Refresh matches data
        if (coupleData?.couple.id) {
          queryClient.invalidateQueries({
            queryKey: [`/api/couple/${coupleData.couple.id}/matches`],
          });
        }
        toast({
          title: "Connection logged",
          description: "Your intimate moment has been recorded",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to log connection",
          variant: "destructive",
        });
      }
    }
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
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
              <p className="text-gray-500 text-sm mb-6">You both indicated you're in the mood</p>
              
              <Button
                onClick={handleConnectionConfirmed}
                className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90"
              >
                We Connected
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl shadow-sm mb-6 animate-slide-up">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How are you feeling?</h3>
              <p className="text-gray-500 text-sm mb-6">We'll let you know if your partner feels the same way</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  How long are you in the mood?
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
                disabled={isInMood || setInMoodMutation.isPending}
                className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isInMood ? "Waiting for partner..." : "In the Mood"}
              </Button>
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

        {/* Recent Connections */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Connections</h3>
              <span className="text-xs text-gray-500">Last 7 days</span>
            </div>
            
            {(matchesData?.matches.filter(match => match.connected) || []).length > 0 ? (
              <div className="space-y-3">
                {(matchesData?.matches.filter(match => match.connected) || []).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                        <Heart className="text-white text-xs" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Intimate Connection</p>
                        <p className="text-xs text-gray-500">
                          {new Date(match.matchedAt).toLocaleDateString()} at {new Date(match.matchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent connections</p>
                <p className="text-xs text-gray-400 mt-1">Press "In the Mood" when you're feeling intimate</p>
              </div>
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
            <button className="flex flex-col items-center py-2 px-3 text-gray-400">
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
          moodType={currentMatch.moodType}
          onStartConversation={handleMatchModalClose}
        />
      )}
    </div>
  );
}
