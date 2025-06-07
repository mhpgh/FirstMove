// Push notification utilities
export interface PushNotificationService {
  requestPermission(): Promise<boolean>;
  subscribeToPush(): Promise<PushSubscription | null>;
  sendNotification(title: string, body: string, data?: any): void;
  isSupported(): boolean;
}

class WebPushNotificationService implements PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<any> {
    try {
      // For this MVP, we'll use simple browser notifications
      if (Notification.permission !== 'granted') {
        return null;
      }
      
      // Return a simple subscription object for the backend
      return {
        endpoint: 'browser-notification',
        keys: {
          p256dh: 'browser-key',
          auth: 'browser-auth'
        },
        toJSON: function() {
          return {
            endpoint: this.endpoint,
            keys: this.keys
          };
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  sendNotification(title: string, body: string, data?: any): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  private getVapidPublicKey(): string {
    // Generate a VAPID key pair for production use
    // For now, using a placeholder - in production you'd generate real keys
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI8g8GfEiQFZfgQ4w8WQY8nPQhLq5d7zlgGYc_CWF9KOHgwfYxY4TEWBIM';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = new WebPushNotificationService();