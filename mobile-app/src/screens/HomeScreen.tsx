import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import ApiService from '../services/ApiService';
import { User, Partner, Couple, Match, Mood } from '../types/User';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
  user: User;
  onLogout: () => void;
}

export default function HomeScreen({ navigation, user, onLogout }: Props) {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isInMood, setIsInMood] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60); // minutes
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadCoupleData();
    loadMoodData();
    setupWebSocket();
    setupNotifications();

    return () => {
      ws?.close();
    };
  }, []);

  const loadCoupleData = async () => {
    try {
      const data = await ApiService.getUserCouple(user.id);
      setCouple(data.couple);
      setPartner(data.partner);
      loadMatches(data.couple.id);
    } catch (error) {
      // User not paired yet
      navigation.navigate('Pairing', { user });
    }
  };

  const loadMoodData = async () => {
    try {
      const data = await ApiService.getUserMoods(user.id);
      setIsInMood(data.moods.length > 0);
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  };

  const loadMatches = async (coupleId: number) => {
    try {
      const data = await ApiService.getCoupleMatches(coupleId);
      const activeMatch = data.matches.find(m => !m.connected);
      setCurrentMatch(activeMatch || null);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const setupWebSocket = () => {
    const websocket = ApiService.createWebSocketConnection(user.id);
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'match') {
        setCurrentMatch(message);
        showMatchNotification();
        startPulseAnimation();
      } else if (message.type === 'connection') {
        setCurrentMatch(null);
        setIsInMood(false);
        showConnectionNotification();
      }
    };

    setWs(websocket);
  };

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Notifications', 'Enable notifications to get alerts when your partner is in the mood!');
    }
  };

  const showMatchNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'You have a match! 💕',
        body: `${partner?.displayName || 'Your partner'} is in the mood too! Time to connect.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  };

  const showConnectionNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Connection made! 🔥',
        body: 'Your partner connected. Enjoy your time together!',
        sound: true,
      },
      trigger: null,
    });
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleSetMood = async () => {
    try {
      await ApiService.setMood(user.id, selectedDuration);
      setIsInMood(true);
      Alert.alert('Mood Set', 'Your partner will be notified!');
    } catch (error) {
      Alert.alert('Error', 'Failed to set mood. Please try again.');
    }
  };

  const handleClearMood = async () => {
    try {
      await ApiService.clearMood(user.id);
      setIsInMood(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear mood. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!currentMatch) return;

    try {
      await ApiService.connectMatch(currentMatch.id);
      setCurrentMatch(null);
      setIsInMood(false);
      Alert.alert('Connected!', 'Enjoy your time together! 💕');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Please try again.');
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings', { user });
  };

  if (!couple || !partner) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FirstMove</Text>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.partnerCard}>
        <Text style={styles.partnerName}>Connected to {partner.displayName}</Text>
        <Text style={styles.partnerStatus}>
          {currentMatch ? '💕 Both in the mood!' : '😊 Connected'}
        </Text>
      </View>

      {currentMatch && (
        <Animated.View style={[styles.matchCard, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.matchTitle}>🔥 You have a match!</Text>
          <Text style={styles.matchText}>
            Both of you are in the mood. Ready to connect?
          </Text>
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect Now</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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
              Waiting for {partner.displayName} to join...
            </Text>
            <TouchableOpacity style={styles.clearMoodButton} onPress={handleClearMood}>
              <Text style={styles.clearMoodButtonText}>Clear Mood</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#666',
  },
  partnerCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partnerStatus: {
    fontSize: 14,
    color: '#666',
  },
  matchCard: {
    backgroundColor: '#FF6B9D',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  connectButtonText: {
    color: '#FF6B9D',
    fontWeight: 'bold',
    fontSize: 16,
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
});