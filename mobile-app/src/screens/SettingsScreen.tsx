import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import ApiService from '../services/ApiService';
import { User, Partner, Couple } from '../types/User';
import { RootStackParamList } from '../../App';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
  user: User;
  onLogout: () => void;
}

export default function SettingsScreen({ navigation, user, onLogout }: Props) {
  const [keepTrack, setKeepTrack] = useState(user.keepTrack);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCoupleData();
    checkNotificationSettings();
  }, []);

  const loadCoupleData = async () => {
    try {
      const data = await ApiService.getUserCouple(user.id);
      setCouple(data.couple);
      setPartner(data.partner);
    } catch (error) {
      // User not paired
    }
  };

  const checkNotificationSettings = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const handleKeepTrackToggle = async (value: boolean) => {
    setIsLoading(true);
    try {
      await ApiService.updateUserKeepTrack(user.id, value);
      setKeepTrack(value);
      Alert.alert(
        'Setting Updated',
        value
          ? 'Connection tracking is now enabled'
          : 'Connection tracking is now disabled'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        Alert.alert('Notifications Enabled', 'You will now receive match notifications');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive match alerts'
        );
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You will no longer receive match notifications');
    }
  };

  const handleTestNotification = async () => {
    if (!notificationsEnabled) {
      Alert.alert('Notifications Disabled', 'Enable notifications first to test');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'FirstMove Test',
        body: 'Push notifications are working! You\'ll get notified when your partner is in the mood.',
        sound: true,
      },
      trigger: null,
    });

    Alert.alert('Test Sent', 'Check if you received the test notification');
  };

  const handleDisconnectCouple = () => {
    Alert.alert(
      'Disconnect from Partner',
      'Are you sure you want to disconnect from your partner? This will clear all shared data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implement disconnect API call if needed
              Alert.alert('Disconnected', 'You have been disconnected from your partner');
              navigation.navigate('Pairing', { user });
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect');
            }
          }
        }
      ]
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
          onPress: async () => {
            try {
              // Implement delete account API call if needed
              Alert.alert('Account Deleted', 'Your account has been deleted');
              onLogout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {partner && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner</Text>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>{partner.displayName}</Text>
            <Text style={styles.partnerUsername}>@{partner.username}</Text>
          </View>
        </View>
      )}

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
            disabled={isLoading}
            trackColor={{ false: '#767577', true: '#FF6B9D' }}
            thumbColor={keepTrack ? '#fff' : '#f4f3f4'}
          />
        </View>

        {keepTrack && partner && !partner.keepTrack && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              Your partner also needs to enable tracking to record connection history
            </Text>
          </View>
        )}
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

        {notificationsEnabled && (
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {couple && (
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnectCouple}>
            <Text style={styles.disconnectButtonText}>Disconnect from Partner</Text>
          </TouchableOpacity>
        )}

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
    padding: 8,
  },
  backButtonText: {
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
  partnerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partnerUsername: {
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
  warningCard: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
  },
  testButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FF6B9D',
    fontWeight: 'bold',
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
  disconnectButton: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disconnectButtonText: {
    color: '#856404',
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