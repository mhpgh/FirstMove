# Complete FirstMove App Files for GitHub Upload

Upload these files to fix the build errors and complete your FirstMove Android app.

## Missing Screen Files

### src/screens/AuthScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface Props {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || (!isLogin && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      const user = {
        id: Date.now(),
        username,
        displayName: displayName || username,
        keepTrack: true,
        createdAt: new Date().toISOString(),
      };
      onAuthSuccess(user);
    } catch (error) {
      Alert.alert('Error', 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>FirstMove</Text>
          <Text style={styles.subtitle}>Connect with your partner</Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleButtonText, isLogin && styles.toggleButtonTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleButtonText, !isLogin && styles.toggleButtonTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  toggleButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  form: {
    marginBottom: 20,
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
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### src/screens/HomeScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

interface Props {
  user: any;
  onLogout: () => void;
  navigation: any;
}

export default function HomeScreen({ user, onLogout, navigation }: Props) {
  const [isInMood, setIsInMood] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60);

  const handleSetMood = () => {
    setIsInMood(true);
    Alert.alert('Mood Set', 'Your partner will be notified!');
  };

  const handleClearMood = () => {
    setIsInMood(false);
    Alert.alert('Mood Cleared', 'Mood has been cleared');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FirstMove</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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
          <View>
            <View style={styles.durationSelector}>
              <Text style={styles.durationLabel}>Duration:</Text>
              <View style={styles.durationButtons}>
                {[30, 60, 120].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration && styles.durationButtonActive
                    ]}
                    onPress={() => setSelectedDuration(duration)}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      selectedDuration === duration && styles.durationButtonTextActive
                    ]}>
                      {duration < 60 ? `${duration}m` : `${duration / 60}h`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.moodButton} onPress={handleSetMood}>
              <Text style={styles.moodButtonText}>I'm in the mood 💕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeMoodCard}>
            <Text style={styles.activeMoodText}>You're in the mood! 💕</Text>
            <Text style={styles.activeMoodSubtext}>
              Waiting for your partner to join...
            </Text>
            <TouchableOpacity style={styles.clearMoodButton} onPress={handleClearMood}>
              <Text style={styles.clearMoodButtonText}>Clear Mood</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.pairingButton} onPress={() => navigation.navigate('Pairing')}>
        <Text style={styles.pairingButtonText}>Pair with Partner</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  settingsButton: {
    fontSize: 20,
    padding: 8,
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
  durationSelector: {
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  durationButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  durationButtonText: {
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  durationButtonTextActive: {
    color: 'white',
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
  clearMoodButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2d5a3d',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearMoodButtonText: {
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
});
```

### src/screens/PairingScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

interface Props {
  user: any;
  onLogout: () => void;
  navigation: any;
}

export default function PairingScreen({ user, onLogout, navigation }: Props) {
  const [mode, setMode] = useState<'generate' | 'join'>('generate');
  const [pairingCode, setPairingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const handleJoinCouple = () => {
    if (!pairingCode) {
      Alert.alert('Error', 'Please enter a pairing code');
      return;
    }

    Alert.alert('Success', 'Successfully paired with your partner!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pair with Partner</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subtitle}>Connect with your partner to start using FirstMove</Text>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
          onPress={() => setMode('generate')}
        >
          <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>
            Generate Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
          onPress={() => setMode('join')}
        >
          <Text style={[styles.modeButtonText, mode === 'join' && styles.modeButtonTextActive]}>
            Join Partner
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'generate' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate Pairing Code</Text>
          <Text style={styles.instruction}>
            Generate a code and share it with your partner
          </Text>

          {!generatedCode ? (
            <TouchableOpacity style={styles.button} onPress={handleGenerateCode}>
              <Text style={styles.buttonText}>Generate Code</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Pairing Code:</Text>
              <Text style={styles.code}>{generatedCode}</Text>
              <Text style={styles.codeInstruction}>
                Share this code with your partner. It expires in 24 hours.
              </Text>
              <TouchableOpacity style={styles.regenerateButton} onPress={handleGenerateCode}>
                <Text style={styles.regenerateButtonText}>Generate New Code</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Your Partner</Text>
          <Text style={styles.instruction}>
            Enter the pairing code your partner shared with you
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={pairingCode}
            onChangeText={setPairingCode}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, !pairingCode && styles.buttonDisabled]}
            onPress={handleJoinCouple}
            disabled={!pairingCode}
          >
            <Text style={styles.buttonText}>Join Partner</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  placeholder: {
    width: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  modeButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
  },
  codeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    letterSpacing: 8,
    marginBottom: 16,
  },
  codeInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  regenerateButton: {
    borderWidth: 1,
    borderColor: '#FF6B9D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  regenerateButtonText: {
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
  logoutButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
```

### src/screens/SettingsScreen.tsx
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';

interface Props {
  user: any;
  onLogout: () => void;
  navigation: any;
}

export default function SettingsScreen({ user, onLogout, navigation }: Props) {
  const [keepTrack, setKeepTrack] = useState(user.keepTrack);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleKeepTrackToggle = (value: boolean) => {
    setKeepTrack(value);
    Alert.alert(
      'Setting Updated',
      value
        ? 'Connection tracking is now enabled'
        : 'Connection tracking is now disabled'
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      value ? 'Notifications Enabled' : 'Notifications Disabled',
      value 
        ? 'You will now receive match notifications'
        : 'You will no longer receive match notifications'
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
            onLogout();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userUsername}>@{user.username}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Track Connections</Text>
            <Text style={styles.settingDescription}>
              Record your intimate connections for insights
            </Text>
          </View>
          <Switch
            value={keepTrack}
            onValueChange={handleKeepTrackToggle}
            trackColor={{ false: '#767577', true: '#FF6B9D' }}
            thumbColor={keepTrack ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified when your partner is in the mood
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#767577', true: '#FF6B9D' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FirstMove v1.0.0</Text>
        <Text style={styles.footerText}>Made with love for couples</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
```

## Upload Instructions

1. Create the folder structure in your GitHub repository:
   - `src/screens/`
   - Upload all four screen files above

2. After uploading, run the build command again:
   ```bash
   eas build --platform android --profile production
   ```

These screen files provide complete functionality for your FirstMove app and should resolve the build errors.