// Simplified security provider for essential auth protection
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityContextType {
  secureSignOut: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { signOut } = useAuth();

  // Simple console warning for production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%cStop! This is a browser feature intended for developers.',
        'color: red; font-size: 16px; font-weight: bold;'
      );
    }
  }, []);

  const secureSignOut = async () => {
    await signOut();
  };

  return (
    <SecurityContext.Provider value={{ secureSignOut }}>
      {children}
    </SecurityContext.Provider>
  );
};