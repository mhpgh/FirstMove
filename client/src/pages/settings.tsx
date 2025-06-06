import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, ArrowLeft, Bell, Users, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Logo } from "@/components/logo";
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

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onNeedsPairing: () => void;
}

export default function SettingsPage({ user, onBack, onNeedsPairing }: SettingsPageProps) {
  const [keepTrack, setKeepTrack] = useState<boolean>(true);
  const [nudgeEnabled, setNudgeEnabled] = useState<boolean>(false);
  const [nudgeDays, setNudgeDays] = useState<number>(7);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch couple data
  const { data: coupleData } = useQuery<CoupleData>({
    queryKey: [`/api/user/${user.id}/couple`],
    retry: false,
  });

  // Initialize settings from user data
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
      setKeepTrack(!keepTrack);
    },
  });

  // Disconnect from partner mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/user/${user.id}/couple`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Partner disconnected",
        description: "You have been disconnected from your partner",
      });
      onNeedsPairing();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect from partner",
        variant: "destructive",
      });
    },
  });

  const handleKeepTrackToggle = (newValue: boolean) => {
    setKeepTrack(newValue);
    updateKeepTrackMutation.mutate(newValue);
  };

  const handleDisconnectConfirm = () => {
    setShowDisconnectDialog(false);
    disconnectMutation.mutate();
  };

  const handleDisconnectCancel = () => {
    setShowDisconnectDialog(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">Settings</span>
          </div>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20 p-4 max-w-md mx-auto space-y-6">
        
        {/* Keep Track Settings */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Keep Track</h3>
                <p className="text-sm text-gray-500">Record your intimate connections</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-700">Track Connections</p>
                <p className="text-sm text-gray-500">Save connection history in Insights</p>
              </div>
              <Switch
                checked={keepTrack}
                onCheckedChange={handleKeepTrackToggle}
                disabled={updateKeepTrackMutation.isPending}
              />
            </div>

            {/* Show tracking status message when partner tracking is off */}
            {keepTrack && coupleData?.partner && !coupleData.partner.keepTrack && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-blue-700">
                  Your partner also needs to enable "Keep Track" to record connection history.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nudge Settings */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Nudge Me</h3>
                <p className="text-sm text-gray-500">Get gentle reminders to connect</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-700">Enable Reminders</p>
                <p className="text-sm text-gray-500">We'll remind you if it's been a while since you last connected.</p>
              </div>
              <Switch
                checked={nudgeEnabled}
                onCheckedChange={setNudgeEnabled}
              />
            </div>

            {nudgeEnabled && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-3">
                  How many days after your last connection would you like to be reminded?
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={nudgeDays}
                    onChange={(e) => setNudgeDays(parseInt(e.target.value) || 7)}
                    className="w-20"
                  />
                  <span className="text-gray-600">days</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner Management */}
        {coupleData?.partner && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Partner</h3>
                  <p className="text-sm text-gray-500">Manage your connection</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {coupleData.partner.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{coupleData.partner.displayName}</p>
                  <p className="text-sm text-gray-500">Connected partner</p>
                </div>
              </div>

              <Button
                onClick={() => setShowDisconnectDialog(true)}
                variant="destructive"
                className="w-full"
                disabled={disconnectMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect from Partner"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDisconnectDialog}
        onClose={handleDisconnectCancel}
        onConfirm={handleDisconnectConfirm}
        title="Disconnect from Partner"
        description={`Are you sure you want to disconnect from ${coupleData?.partner?.displayName}? This will remove all connection history and you'll need to pair again to reconnect.`}
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}