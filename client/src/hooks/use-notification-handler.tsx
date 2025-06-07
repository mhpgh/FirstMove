import { useEffect } from "react";
import { WebSocketMessage } from "./use-websocket";
import { mobilePushService } from "@/lib/mobile-push-notifications";
import { useNotifications } from "@/contexts/notification-context";

interface NotificationHandlerProps {
  lastMessage: WebSocketMessage | null;
  partnerName?: string;
}

export function useNotificationHandler({ lastMessage, partnerName }: NotificationHandlerProps) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'match') {
      // Add in-app notification
      addNotification('match', `You have a match! ${partnerName || 'Your partner'} is in the mood too.`);
      
      // Send browser push notification
      pushNotificationService.sendNotification(
        "You have a match! 💕",
        `${partnerName || 'Your partner'} is in the mood too! Time to connect.`,
        { type: 'match', matchId: lastMessage.matchId }
      );
    }

    if (lastMessage.type === 'connection') {
      // Add in-app notification
      addNotification('connection', 'Connection made! Enjoy your time together.');
      
      // Send browser push notification
      pushNotificationService.sendNotification(
        "Connection made! 🔥",
        "Your partner connected. Enjoy your time together!",
        { type: 'connection', matchId: lastMessage.matchId }
      );
    }
  }, [lastMessage, partnerName, addNotification]);
}