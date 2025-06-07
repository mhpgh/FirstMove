import { User, Partner, Couple, Match, Mood } from '../types/User';

const API_BASE_URL = 'https://6654dd72-2db1-449d-8c50-76996ae1b1d0-00-31bgwtp0zk1q0.riker.replit.dev'; // Your current Replit app URL

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string): Promise<User> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.user;
  }

  async register(username: string, password: string, displayName: string): Promise<User> {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    });
    return response.user;
  }

  // User operations
  async getUser(userId: number): Promise<User> {
    const response = await this.request(`/api/user/${userId}`);
    return response.user;
  }

  async updateUserKeepTrack(userId: number, keepTrack: boolean): Promise<void> {
    await this.request(`/api/user/${userId}/keep-track`, {
      method: 'PUT',
      body: JSON.stringify({ keepTrack }),
    });
  }

  // Couple operations
  async getUserCouple(userId: number): Promise<{ couple: Couple; partner: Partner }> {
    return this.request(`/api/user/${userId}/couple`);
  }

  async createPairingCode(userId: number): Promise<{ pairingCode: string }> {
    return this.request(`/api/pairing/generate`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async joinCouple(pairingCode: string): Promise<void> {
    await this.request('/api/pairing/join', {
      method: 'POST',
      body: JSON.stringify({ pairingCode }),
    });
  }

  // Mood operations
  async getUserMoods(userId: number): Promise<{ moods: Mood[] }> {
    return this.request(`/api/user/${userId}/moods`);
  }

  async setMood(userId: number, duration: number): Promise<Mood> {
    const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
    const response = await this.request('/api/mood', {
      method: 'POST',
      body: JSON.stringify({ userId, duration, expiresAt }),
    });
    return response.mood;
  }

  async clearMood(userId: number): Promise<void> {
    await this.request(`/api/user/${userId}/moods/deactivate`, {
      method: 'PUT',
    });
  }

  // Match operations
  async getCoupleMatches(coupleId: number): Promise<{ matches: Match[] }> {
    return this.request(`/api/couple/${coupleId}/matches`);
  }

  async connectMatch(matchId: number): Promise<{ success: boolean; recorded: boolean }> {
    return this.request(`/api/match/${matchId}/connect`, {
      method: 'PUT',
    });
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(userId: number): WebSocket {
    const wsUrl = API_BASE_URL.replace('https:', 'wss:').replace('http:', 'ws:') + '/ws';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userId }));
    };
    
    return ws;
  }
}

export default new ApiService();