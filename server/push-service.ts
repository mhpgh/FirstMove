import { storage } from "./storage";

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
}

export class PushNotificationService {
  async sendToUser(userId: number, payload: PushNotificationPayload): Promise<void> {
    try {
      const subscriptions = await storage.getPushSubscriptionsByUserId(userId);
      
      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      for (const subscription of subscriptions) {
        try {
          await this.sendPushNotification(subscription, payload);
        } catch (error) {
          console.error(`Failed to send push notification to subscription ${subscription.id}:`, error);
          // Could clean up invalid subscriptions here
        }
      }
    } catch (error) {
      console.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  private async sendPushNotification(subscription: any, payload: PushNotificationPayload): Promise<void> {
    // For this MVP, we'll use the browser's built-in notification API
    // In production, you'd use a service like web-push with VAPID keys
    console.log(`Would send push notification to ${subscription.endpoint}:`, payload);
    
    // The actual push notification would be sent via service worker
    // For now, we'll just log the notification that would be sent
    // This would typically require VAPID keys and a proper push service
  }

  async sendMatchNotification(userId: number, partnerName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: "You have a match! 💕",
      body: `${partnerName} is in the mood too! Time to connect.`,
      data: { type: 'match' }
    });
  }

  async sendConnectionNotification(userId: number): Promise<void> {
    await this.sendToUser(userId, {
      title: "Connection made! 🔥",
      body: "Your partner connected. Enjoy your time together!",
      data: { type: 'connection' }
    });
  }
}

export const pushService = new PushNotificationService();