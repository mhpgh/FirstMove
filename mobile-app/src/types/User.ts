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