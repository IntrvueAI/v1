// Security provider component for enhanced security context
import React, { createContext, useContext, useEffect } from 'react';
import { useSecureSession } from '@/hooks/useSecureSession';

interface SecurityContextType {
  validateSession: () => boolean;
  secureSignOut: () => Promise<void>;
  getCsrfToken: () => string | null;
  refreshSession: () => void;
  isSessionValid: boolean;
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
  const secureSession = useSecureSession();

  // Security monitoring - removed ineffective client-side protections
  // Focus on server-side security instead

  // Console warning for security - only in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.clear();
      console.log(
        '%cStop!',
        'color: red; font-size: 50px; font-weight: bold;'
      );
      console.log(
        '%cThis is a browser feature intended for developers. Do not paste or enter any code here as it could compromise your account security.',
        'color: red; font-size: 16px;'
      );
    }
  }, []);

  return (
    <SecurityContext.Provider value={secureSession}>
      {children}
    </SecurityContext.Provider>
  );
};