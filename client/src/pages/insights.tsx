import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Info, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/auth";

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
  moodType: string;
  matchedAt: string;
  acknowledged: boolean;
  connected: boolean;
  connectedAt: string | null;
}

interface InsightsPageProps {
  user: User;
  onBack: () => void;
}

export default function InsightsPage({ user, onBack }: InsightsPageProps) {
  const [keepTrack, setKeepTrack] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch couple data
  const { data: coupleData } = useQuery<CoupleData>({
    queryKey: [`/api/user/${user.id}/couple`],
    retry: false,
  });

  // Fetch recent matches
  const { data: matchesData } = useQuery<{ matches: Match[] }>({
    queryKey: [`/api/couple/${coupleData?.couple.id}/matches`],
    enabled: !!coupleData?.couple.id,
  });

  // Initialize keepTrack state from user data
  useEffect(() => {
    if (user.keepTrack !== undefined) {
      setKeepTrack(user.keepTrack);
    }
  }, [user.keepTrack]);

  // Update keep track preference mutation
  const updateKeepTrackMutation = useMutation({
    mutationFn: async (newKeepTrack: boolean) => {
      const response = await apiRequest("PUT", `/api/user/${user.id}/keep-track`, {
        keepTrack: newKeepTrack,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user.id}/couple`] });
      queryClient.invalidateQueries({ queryKey: [`/api/couple/${coupleData?.couple.id}/matches`] });
      toast({
        title: "Settings updated",
        description: keepTrack ? "Connection tracking is now enabled" : "Connection tracking is now disabled and history cleared",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tracking preference",
        variant: "destructive",
      });
      // Reset the switch on error
      setKeepTrack(!keepTrack);
    },
  });

  const handleKeepTrackToggle = (newValue: boolean) => {
    if (!newValue && (matchesData?.matches.filter(match => match.connected) || []).length > 0) {
      // Show confirmation dialog if turning off and history exists
      setShowConfirmDialog(true);
    } else {
      // No history or turning on, proceed immediately
      setKeepTrack(newValue);
      updateKeepTrackMutation.mutate(newValue);
    }
  };

  const handleConfirmDisableTracking = () => {
    setShowConfirmDialog(false);
    setKeepTrack(false);
    updateKeepTrackMutation.mutate(false);
  };

  const handleCancelDisableTracking = () => {
    setShowConfirmDialog(false);
    // Keep the switch in the "on" position
  };

  const connectedMatches = matchesData?.matches.filter(match => match.connected) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">Insights</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* Connection Statistics */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{connectedMatches.length}</div>
                <div className="text-sm text-gray-500">Total Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {connectedMatches.length > 0 ? Math.round(connectedMatches.length / 7) || 1 : 0}
                </div>
                <div className="text-sm text-gray-500">Per Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Connections */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Connections</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Keep Track</span>
                <Switch 
                  checked={keepTrack} 
                  onCheckedChange={handleKeepTrackToggle}
                  disabled={updateKeepTrackMutation.isPending}
                />
              </div>
            </div>

            {/* Show tracking status message when partner tracking is off */}
            {keepTrack && coupleData?.partner && !coupleData.partner.keepTrack && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg mb-4">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Your partner also needs to enable "Keep Track" to record connection history.
                </p>
              </div>
            )}
            
            {keepTrack && connectedMatches.length > 0 ? (
              <div className="space-y-3">
                {connectedMatches.map((match) => (
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
                {keepTrack ? (
                  <>
                    <p className="text-gray-500">No recent connections</p>
                    <p className="text-xs text-gray-400 mt-1">Press "In the Mood" when you're feeling intimate</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">Connection tracking is disabled</p>
                    <p className="text-xs text-gray-400 mt-1">Enable "Keep Track" to record your intimate moments</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Confirm Dialog for Disabling Keep Track */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDisableTracking}
        onConfirm={handleConfirmDisableTracking}
        title="Disable Connection Tracking?"
        description="This will permanently delete all your connection history. This action cannot be undone."
        confirmText="Delete History"
        cancelText="Keep Tracking"
        variant="destructive"
      />
    </div>
  );
}