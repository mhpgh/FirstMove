import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface MobilePushService {
  requestPermission(): Promise<boolean>;
  subscribeToPush(): Promise<any>;
  sendLocalNotification(title: string, body: string, data?: any): void;
  isSupported(): boolean;
}

class CapacitorPushService implements MobilePushService {
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Request permission for push notifications
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request push notification permission:', error);
      return false;
    }
  }

  async subscribeToPush(): Promise<any> {
    try {
      if (!this.isSupported()) {
        return null;
      }

      // Listen for registration success
      return new Promise((resolve, reject) => {
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          const subscription = {
            endpoint: `fcm:${token.value}`,
            keys: {
              p256dh: 'capacitor-key',
              auth: 'capacitor-auth'
            },
            toJSON: function() {
              return {
                endpoint: subscription.endpoint,
                keys: subscription.keys
              };
            }
          };
          resolve(subscription);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Registration error: ', err.error);
          reject(err);
        });

        // Trigger registration
        this.requestPermission();
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: data,
            iconColor: '#FF6B9D',
            sound: 'default'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  setupListeners(): void {
    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      // Show local notification when app is in foreground
      this.sendLocalNotification(
        notification.title || 'FirstMove',
        notification.body || 'You have a new notification',
        notification.data
      );
    });

    // Listen for push notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed: ', action);
      
      // Handle notification tap
      if (action.notification.data?.type === 'match') {
        // Navigate to home screen or match screen
        window.location.hash = '#/home';
      }
    });
  }
}

// Fallback to browser notifications for web
class BrowserPushService implements MobilePushService {
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<any> {
    if (Notification.permission !== 'granted') {
      return null;
    }
    
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
  }

  sendLocalNotification(title: string, body: string, data?: any): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      data,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  setupListeners(): void {
    // No additional listeners needed for browser notifications
  }
}

// Export the appropriate service based on platform
export const mobilePushService = Capacitor.isNativePlatform() 
  ? new CapacitorPushService() 
  : new BrowserPushService();