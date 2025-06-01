import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, Home, BarChart3, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodCard } from "@/components/mood-card";
import { MatchModal } from "@/components/match-modal";
import { ConnectionStatus } from "@/components/connection-status";
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

const moodOptions = [
  { emoji: "💕", label: "Romantic", moodType: "romantic" },
  { emoji: "😊", label: "Playful", moodType: "playful" },
  { emoji: "🔥", label: "Intimate", moodType: "intimate" },
  { emoji: "🤗", label: "Cuddly", moodType: "cuddly" },
];

interface HomePageProps {
  user: User;
  onNeedsPairing: () => void;
  onLogout: () => void;
}

export default function HomePage({ user, onNeedsPairing, onLogout }: HomePageProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
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

  // Set mood mutation
  const setMoodMutation = useMutation({
    mutationFn: async (moodType: string) => {
      const response = await apiRequest("POST", "/api/mood", {
        userId: user.id,
        moodType,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood updated",
        description: "Your mood has been shared privately with your partner",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mood",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "match") {
      setCurrentMatch(lastMessage);
      setShowMatchModal(true);
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

  const handleMoodSelect = (moodType: string) => {
    setSelectedMood(moodType);
    setMoodMutation.mutate(moodType);
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
  };

  const handleStartConversation = () => {
    // In a real app, this would navigate to a chat or messaging interface
    toast({
      title: "Feature coming soon",
      description: "Chat functionality will be available in the next update",
    });
    handleMatchModalClose();
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
            <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
              <Heart className="text-white text-sm" />
            </div>
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

        {/* Mood Selection */}
        <Card className="rounded-2xl shadow-sm mb-6 animate-slide-up">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How are you feeling?</h3>
            <p className="text-gray-500 text-sm mb-6">Share your mood privately with your partner</p>
            
            <div className="grid grid-cols-2 gap-3">
              {moodOptions.map((mood) => (
                <MoodCard
                  key={mood.moodType}
                  emoji={mood.emoji}
                  label={mood.label}
                  moodType={mood.moodType}
                  isSelected={selectedMood === mood.moodType}
                  onClick={handleMoodSelect}
                />
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="text-white text-xs" />
                </div>
                <p className="text-sm text-gray-600">Your mood is only shared when there's a mutual match</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Suggestions */}
        <Card className="rounded-2xl shadow-sm mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Activities</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🍷</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">Dinner & Wine</p>
                  <p className="text-xs text-gray-500">Perfect for romantic evening</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                  Try
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💆</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">Massage Session</p>
                  <p className="text-xs text-gray-500">Relax and connect</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                  Try
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Connections</h3>
              <span className="text-xs text-gray-500">Last 7 days</span>
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                        <Heart className="text-white text-xs" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Mutual Match</p>
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
                <p className="text-gray-500">No recent matches</p>
                <p className="text-xs text-gray-400 mt-1">Share your mood to start connecting</p>
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
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
}
