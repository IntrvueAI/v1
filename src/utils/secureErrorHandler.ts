// Secure error handling utilities
export interface SecureError {
  userMessage: string;
  logMessage: string;
  statusCode: number;
}

// Sanitize error messages to prevent information disclosure
export const sanitizeErrorMessage = (error: any): string => {
  // Secure error messages for users - never expose internal details
  const secureMessages = {
    authentication: 'Authentication failed. Please check your credentials.',
    authorization: 'Access denied.',
    validation: 'Invalid input. Please check your data.',
    network: 'Connection error. Please try again.',
    server: 'Something went wrong. Please try again.',
    rateLimit: 'Too many requests. Please wait.',
    notFound: 'Resource not found.',
    timeout: 'Request timed out. Please try again.',
  };

  // Log safely in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error?.message || 'Unknown error');
  }

  // Return appropriate secure message based on error type
  if (error?.status === 401 || error?.message?.toLowerCase().includes('auth')) {
    return secureMessages.authentication;
  }
  if (error?.status === 403) return secureMessages.authorization;
  if (error?.status === 400) return secureMessages.validation;
  if (error?.status === 404) return secureMessages.notFound;
  if (error?.status === 429) return secureMessages.rateLimit;
  if (error?.status === 408) return secureMessages.timeout;
  if (error?.code === 'NETWORK_ERROR') return secureMessages.network;

  return secureMessages.server;
};

// Simple rate limiter for basic protection
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    this.attempts.set(identifier, recentAttempts);
    return recentAttempts.length >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }
}

// Basic rate limiter for auth attempts
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000);