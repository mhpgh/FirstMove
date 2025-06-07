import { useEffect, useRef, useState } from "react";
import { User } from "@/lib/auth";

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(user: User | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        // Authenticate with the server
        try {
          ws.current?.send(JSON.stringify({
            type: 'auth',
            userId: user.id
          }));
        } catch (error) {
          console.error("Error sending auth message:", error);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
    }

    return () => {
      try {
        ws.current?.close();
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
    };
  }, [user]);

  const sendMessage = (message: WebSocketMessage) => {
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}
