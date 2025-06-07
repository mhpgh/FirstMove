import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/contexts/push-notification-context";
import { useToast } from "@/hooks/use-toast";

export function PushNotificationSettings() {
  const { 
    isSupported, 
    hasPermission, 
    isSubscribed, 
    requestPermission, 
    subscribe, 
    sendTestNotification 
  } = usePushNotifications();
  const { toast } = useToast();

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        const subscribed = await subscribe();
        if (subscribed) {
          toast({
            title: "Notifications enabled",
            description: "You'll now receive push notifications when your partner is in the mood.",
          });
        } else {
          toast({
            title: "Subscription failed",
            description: "Could not set up push notifications. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Permission denied",
          description: "Push notifications were blocked. You can enable them in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
    toast({
      title: "Test sent",
      description: "Check if you received the test notification.",
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To receive notifications, try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
          {hasPermission && isSubscribed && (
            <Badge variant="secondary">Enabled</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Get notified instantly when your partner is in the mood, even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasPermission ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Enable notifications to never miss a moment</span>
            </div>
            <Button onClick={handleEnableNotifications} className="w-full">
              Enable Push Notifications
            </Button>
          </div>
        ) : !isSubscribed ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permission granted, but notifications are not set up yet.
            </p>
            <Button onClick={subscribe} className="w-full">
              Set Up Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Bell className="h-4 w-4" />
              <span>Push notifications are active</span>
            </div>
            <Button variant="outline" onClick={handleTestNotification} className="w-full">
              Send Test Notification
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Notifications work even when the app is closed</p>
          <p>• You can disable them anytime in your browser settings</p>
          <p>• No personal data is stored on external servers</p>
        </div>
      </CardContent>
    </Card>
  );
}