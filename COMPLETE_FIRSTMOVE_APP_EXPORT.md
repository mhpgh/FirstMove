# FirstMove Mobile App - Complete Source Code Export

Upload these files to your GitHub repository to build the complete FirstMove Android app.

## GitHub Repository Structure
```
FirstMove/
├── App.tsx
├── package.json
├── app.json
├── eas.json
├── babel.config.js
└── src/
    ├── types/
    │   └── User.ts
    ├── services/
    │   └── ApiService.ts
    └── screens/
        ├── AuthScreen.tsx
        ├── HomeScreen.tsx
        ├── PairingScreen.tsx
        └── SettingsScreen.tsx
```

## File Contents

### Root: App.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import AuthScreen from './src/screens/AuthScreen';
import PairingScreen from './src/screens/PairingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { User } from './src/types/User';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type RootStackParamList = {
  Auth: undefined;
  Pairing: { user: User };
  Home: { user: User };
  Settings: { user: User };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    registerForPushNotifications();
  }, []);

  const checkAuthState = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B9D',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission not granted for notifications');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  };

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    AsyncStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    AsyncStorage.removeItem('user');
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onAuthSuccess={handleAuthSuccess} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Pairing">
              {(props) => <PairingScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {(props) => <SettingsScreen {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Root: package.json
```json
{
  "name": "firstmove-mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo build:android",
    "publish": "expo publish"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "expo": "~50.0.0",
    "expo-constants": "~15.4.0",
    "expo-notifications": "~0.27.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.2",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "react-native-vector-icons": "^10.0.3"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.3.0"
  }
}
```

### Root: app.json
```json
{
  "expo": {
    "name": "FirstMove",
    "slug": "firstmove-couples",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.firstmove.couples",
      "versionCode": 1,
      "permissions": [
        "NOTIFICATIONS"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

### Root: eas.json
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Root: babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### src/types/User.ts
```typescript
export interface User {
  id: number;
  username: string;
  displayName: string;
  keepTrack: boolean;
  createdAt: string;
}

export interface Partner {
  id: number;
  username: string;
  displayName: string;
  keepTrack: boolean;
  createdAt: string;
}

export interface Couple {
  id: number;
  user1Id: number;
  user2Id: number;
  isActive: boolean;
  createdAt: string;
}

export interface Match {
  id: number;
  coupleId: number;
  matchedAt: string;
  acknowledged: boolean;
  connected: boolean;
  connectedAt: string | null;
  recorded: boolean;
}

export interface Mood {
  id: number;
  userId: number;
  duration: number;
  expiresAt: string;
  createdAt: string;
}
```

### src/services/ApiService.ts
```typescript
import { User, Partner, Couple, Match, Mood } from '../types/User';

const API_BASE_URL = 'https://6654dd72-2db1-449d-8c50-76996ae1b1d0-00-31bgwtp0zk1q0.riker.replit.dev';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(username: string, password: string): Promise<User> {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string, displayName: string): Promise<User> {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    });
  }

  async getUserCouple(userId: number): Promise<{ couple: Couple; partner: Partner }> {
    return this.request(`/api/user/${userId}/couple`);
  }

  async createPairingCode(userId: number): Promise<{ pairingCode: string }> {
    return this.request('/api/pairing/generate', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async joinCouple(pairingCode: string): Promise<void> {
    return this.request('/api/pairing/join', {
      method: 'POST',
      body: JSON.stringify({ pairingCode }),
    });
  }

  async setMood(userId: number, duration: number): Promise<Mood> {
    return this.request('/api/mood', {
      method: 'POST',
      body: JSON.stringify({ userId, duration }),
    });
  }

  async clearMood(userId: number): Promise<void> {
    return this.request(`/api/user/${userId}/mood`, {
      method: 'DELETE',
    });
  }

  async getUserMoods(userId: number): Promise<{ moods: Mood[] }> {
    return this.request(`/api/user/${userId}/moods`);
  }

  async getCoupleMatches(coupleId: number): Promise<{ matches: Match[] }> {
    return this.request(`/api/couple/${coupleId}/matches`);
  }

  async connectMatch(matchId: number): Promise<void> {
    return this.request(`/api/match/${matchId}/connect`, {
      method: 'POST',
    });
  }

  async updateUserKeepTrack(userId: number, keepTrack: boolean): Promise<void> {
    return this.request(`/api/user/${userId}/keep-track`, {
      method: 'PATCH',
      body: JSON.stringify({ keepTrack }),
    });
  }

  createWebSocketConnection(userId: number): WebSocket {
    const wsUrl = API_BASE_URL.replace('https:', 'wss:').replace('http:', 'ws:') + '/ws';
    const socket = new WebSocket(`${wsUrl}?userId=${userId}`);
    return socket;
  }
}

export default new ApiService();
```

## Build Instructions

1. Upload all files to GitHub repository
2. Open GitHub Codespaces
3. Run:
   ```bash
   npm install -g @expo/cli eas-cli
   eas login
   eas build --platform android --profile production
   ```

This creates a production Android App Bundle for Google Play Store submission.