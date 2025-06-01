import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  displayName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = "hintly_auth";

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const authState = JSON.parse(stored);
      return {
        user: authState.user,
        isAuthenticated: !!authState.user
      };
    }
  } catch (error) {
    console.error("Error parsing stored auth:", error);
  }
  
  return {
    user: null,
    isAuthenticated: false
  };
}

export function setStoredAuth(user: User | null): void {
  const authState = {
    user,
    isAuthenticated: !!user
  };
  
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export async function loginUser(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", {
    username,
    password
  });
  
  const data = await response.json();
  return data.user;
}

export async function registerUser(username: string, password: string, displayName: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", {
    username,
    password,
    displayName
  });
  
  const data = await response.json();
  return data.user;
}

export function logoutUser(): void {
  setStoredAuth(null);
}
