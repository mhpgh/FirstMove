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
import { StackNavigationProp } from '@react-navigation/stack';
import ApiService from '../services/ApiService';
import { User } from '../types/User';
import { RootStackParamList } from '../../App';

type PairingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Pairing'>;

interface Props {
  navigation: PairingScreenNavigationProp;
  user: User;
  onLogout: () => void;
}

export default function PairingScreen({ navigation, user, onLogout }: Props) {
  const [mode, setMode] = useState<'generate' | 'join'>('generate');
  const [pairingCode, setPairingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.createPairingCode(user.id);
      setGeneratedCode(response.pairingCode);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate pairing code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (!pairingCode) {
      Alert.alert('Error', 'Please enter a pairing code');
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.joinCouple(pairingCode);
      Alert.alert('Success', 'Successfully paired!', [
        { text: 'OK', onPress: () => navigation.navigate('Home', { user }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Invalid pairing code or failed to join');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pair with Partner</Text>
        <Text style={styles.subtitle}>Connect with your partner to start using FirstMove</Text>
      </View>

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
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleGenerateCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Generating...' : 'Generate Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Pairing Code:</Text>
              <Text style={styles.code}>{generatedCode}</Text>
              <Text style={styles.codeInstruction}>
                Share this code with your partner. It expires in 24 hours.
              </Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={handleGenerateCode}
              >
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
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleJoinCouple}
            disabled={isLoading || !pairingCode}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Joining...' : 'Join Partner'}
            </Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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