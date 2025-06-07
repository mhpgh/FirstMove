import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mobilePushService } from '@/lib/mobile-push-notifications';
import { User } from '@/lib/auth';

interface PushNotificationContextType {
  isSupported: boolean;
  hasPermission: boolean;
  isSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  sendTestNotification: () => void;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

interface PushNotificationProviderProps {
  children: ReactNode;
  user: User | null;
}

export function PushNotificationProvider({ children, user }: PushNotificationProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supported = mobilePushService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      // For mobile, check permissions differently
      setHasPermission(false); // Will be set when permission is granted
      mobilePushService.setupListeners?.();
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await mobilePushService.requestPermission();
    setHasPermission(granted);
    return granted;
  };

  const subscribe = async (): Promise<boolean> => {
    if (!hasPermission) {
      return false;
    }

    const subscription = await mobilePushService.subscribeToPush();
    const success = subscription !== null;
    setIsSubscribed(success);

    if (success && user) {
      // Store subscription on server
      try {
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            subscription: subscription.toJSON()
          })
        });
      } catch (error) {
        console.error('Failed to store push subscription:', error);
      }
    }

    return success;
  };

  const sendTestNotification = () => {
    mobilePushService.sendLocalNotification(
      'FirstMove Test',
      'Push notifications are working! You\'ll get notified when your partner is in the mood.',
      { type: 'test' }
    );
  };

  return (
    <PushNotificationContext.Provider value={{
      isSupported,
      hasPermission,
      isSubscribed,
      requestPermission,
      subscribe,
      sendTestNotification
    }}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
}