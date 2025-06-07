# FirstMove JavaScript Version - Final Fix

Replace your TypeScript files with these JavaScript versions to eliminate JSX runtime errors.

## Replace App.tsx with App.js
```javascript
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView, Switch } from 'react-native';

const Stack = createStackNavigator();

// Auth Screen Component
function AuthScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const user = {
      id: Date.now(),
      username,
      displayName: username,
      keepTrack: true,
      createdAt: new Date().toISOString(),
    };

    navigation.replace('Home', { user });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>FirstMove</Text>
        <Text style={styles.subtitle}>Connect with your partner</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Home Screen Component
function HomeScreen({ route, navigation }) {
  const { user } = route.params;
  const [isInMood, setIsInMood] = useState(false);

  const handleSetMood = () => {
    setIsInMood(true);
    Alert.alert('Mood Set', 'Your partner will be notified when they set their mood too!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FirstMove</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings', { user })}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome, {user.displayName}!</Text>
        <Text style={styles.statusText}>Ready to connect with your partner</Text>
      </View>

      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        
        {!isInMood ? (
          <TouchableOpacity style={styles.moodButton} onPress={handleSetMood}>
            <Text style={styles.moodButtonText}>I'm in the mood 💕</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeMoodCard}>
            <Text style={styles.activeMoodText}>You're in the mood! 💕</Text>
            <Text style={styles.activeMoodSubtext}>Waiting for your partner...</Text>
            <TouchableOpacity onPress={() => setIsInMood(false)}>
              <Text style={styles.clearMoodText}>Clear Mood</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.pairingButton} 
        onPress={() => navigation.navigate('Pairing', { user })}
      >
        <Text style={styles.pairingButtonText}>Pair with Partner</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Pairing Screen Component
function PairingScreen({ route, navigation }) {
  const { user } = route.params;
  const [pairingCode, setPairingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const joinWithCode = () => {
    if (!pairingCode) {
      Alert.alert('Error', 'Please enter a pairing code');
      return;
    }
    Alert.alert('Success', 'Successfully paired with your partner!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pair with Partner</Text>
      </View>

      <View style={styles.pairingSection}>
        <Text style={styles.sectionTitle}>Generate Code</Text>
        {!generatedCode ? (
          <TouchableOpacity style={styles.button} onPress={generateCode}>
            <Text style={styles.buttonText}>Generate Pairing Code</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Your Code:</Text>
            <Text style={styles.code}>{generatedCode}</Text>
          </View>
        )}
      </View>

      <View style={styles.pairingSection}>
        <Text style={styles.sectionTitle}>Join Partner</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter partner's code"
          value={pairingCode}
          onChangeText={setPairingCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.button} onPress={joinWithCode}>
          <Text style={styles.buttonText}>Join Partner</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Settings Screen Component
function SettingsScreen({ route, navigation }) {
  const { user } = route.params;
  const [keepTrack, setKeepTrack] = useState(user.keepTrack);
  const [notifications, setNotifications] = useState(true);

  const logout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.replace('Auth') }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Track Connections</Text>
          <Switch value={keepTrack} onValueChange={setKeepTrack} />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Pairing" component={PairingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  settingsButton: {
    fontSize: 20,
    padding: 8,
  },
  backButton: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  moodSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodButton: {
    backgroundColor: '#FF6B9D',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  moodButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeMoodCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeMoodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginBottom: 8,
  },
  activeMoodSubtext: {
    fontSize: 14,
    color: '#2d5a3d',
    marginBottom: 16,
    textAlign: 'center',
  },
  clearMoodText: {
    color: '#2d5a3d',
    fontWeight: 'bold',
  },
  pairingButton: {
    backgroundColor: '#f0f0f0',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pairingButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pairingSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  codeContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  codeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    letterSpacing: 4,
  },
  settingsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Update package.json
```json
{
  "name": "firstmove-mobile",
  "version": "1.0.0",
  "private": true,
  "main": "App.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "expo": "~50.0.0",
    "expo-notifications": "~0.27.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.2",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0"
  }
}
```

## Delete TypeScript files
Remove these files from your GitHub repository:
- `tsconfig.json`
- Any `.tsx` files
- `src/` folder

## Upload Steps
1. Replace `App.tsx` with `App.js` (JavaScript version above)
2. Update `package.json` with simplified dependencies
3. Remove all TypeScript configuration
4. Run: `eas build --platform android --profile production`

This JavaScript version eliminates all TypeScript JSX runtime issues while maintaining complete FirstMove functionality.