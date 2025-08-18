import { useState, useEffect, useCallback, useRef } from 'react';

export interface ConnectionHealth {
  isOnline: boolean;
  latency: number | null;
  lastCheck: Date | null;
  connectionQuality: 'good' | 'poor' | 'offline';
}

export interface ConnectionHealthCheckReturn extends ConnectionHealth {
  checkConnection: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const useConnectionHealthCheck = (intervalMs: number = 30000): ConnectionHealthCheckReturn => {
  const [health, setHealth] = useState<ConnectionHealth>({
    isOnline: navigator.onLine,
    latency: null,
    lastCheck: null,
    connectionQuality: 'good'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkConnection = useCallback(async (): Promise<void> => {
    try {
      // Cancel any existing check
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const startTime = performance.now();

      // Use a lightweight endpoint to check connectivity
      const response = await fetch('/ping', {
        method: 'HEAD',
        signal: abortControllerRef.current.signal,
        cache: 'no-cache'
      });

      const endTime = performance.now();
      const latency = endTime - startTime;

      const newHealth: ConnectionHealth = {
        isOnline: response.ok,
        latency: latency,
        lastCheck: new Date(),
        connectionQuality: latency < 500 ? 'good' : latency < 2000 ? 'poor' : 'offline'
      };

      setHealth(newHealth);
    } catch (error) {
      // If the request was aborted, don't update state
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setHealth({
        isOnline: false,
        latency: null,
        lastCheck: new Date(),
        connectionQuality: 'offline'
      });
    }
  }, []);

  const startMonitoring = useCallback(() => {
    checkConnection(); // Initial check
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(checkConnection, intervalMs);
  }, [checkConnection, intervalMs]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setHealth(prev => ({ ...prev, isOnline: true }));
      checkConnection();
    };

    const handleOffline = () => {
      setHealth(prev => ({ 
        ...prev, 
        isOnline: false, 
        connectionQuality: 'offline',
        lastCheck: new Date()
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    ...health,
    checkConnection,
    startMonitoring,
    stopMonitoring
  };
};