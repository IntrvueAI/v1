// Security monitoring utility for detecting suspicious activity
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'suspicious_request' | 'api_error';
  timestamp: number;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 100;
  private readonly alertThresholds = {
    auth_failures: 5, // failures per 5 minutes
    rate_limit_hits: 3, // rate limit hits per 10 minutes
    api_errors: 10, // API errors per 5 minutes
  };

  constructor() {
    // Clean up old events every 30 minutes
    setInterval(() => this.cleanupOldEvents(), 30 * 60 * 1000);
  }

  recordEvent(type: SecurityEvent['type'], details: Record<string, any>, severity: SecurityEvent['severity'] = 'medium') {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      details,
      severity,
    };

    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Check for security alerts
    this.checkSecurityThresholds();

    // Log critical events
    if (severity === 'critical') {
      console.error('SECURITY ALERT:', event);
    }
  }

  private cleanupOldEvents() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > oneHourAgo);
  }

  private checkSecurityThresholds() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const tenMinutesAgo = now - (10 * 60 * 1000);

    // Check auth failures
    const recentAuthFailures = this.events.filter(
      event => event.type === 'auth_failure' && event.timestamp > fiveMinutesAgo
    ).length;

    if (recentAuthFailures >= this.alertThresholds.auth_failures) {
      this.triggerSecurityAlert('Multiple authentication failures detected', 'high');
    }

    // Check rate limit hits
    const recentRateLimits = this.events.filter(
      event => event.type === 'rate_limit' && event.timestamp > tenMinutesAgo
    ).length;

    if (recentRateLimits >= this.alertThresholds.rate_limit_hits) {
      this.triggerSecurityAlert('Multiple rate limit violations detected', 'high');
    }

    // Check API errors
    const recentApiErrors = this.events.filter(
      event => event.type === 'api_error' && event.timestamp > fiveMinutesAgo
    ).length;

    if (recentApiErrors >= this.alertThresholds.api_errors) {
      this.triggerSecurityAlert('High number of API errors detected', 'medium');
    }
  }

  private triggerSecurityAlert(message: string, severity: SecurityEvent['severity']) {
    console.warn(`SECURITY THRESHOLD EXCEEDED (${severity}): ${message}`);
    
    // In production, this could send alerts to monitoring services
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Could integrate with monitoring services here
    }
  }

  // Get security metrics for dashboard
  getSecurityMetrics() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const last24Hours = now - (24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(event => event.timestamp > lastHour);
    const dailyEvents = this.events.filter(event => event.timestamp > last24Hours);

    return {
      events_last_hour: recentEvents.length,
      events_last_24h: dailyEvents.length,
      critical_events_last_hour: recentEvents.filter(e => e.severity === 'critical').length,
      auth_failures_last_hour: recentEvents.filter(e => e.type === 'auth_failure').length,
      rate_limit_hits_last_hour: recentEvents.filter(e => e.type === 'rate_limit').length,
    };
  }

  // Clear all events (for testing or reset)
  clearEvents() {
    this.events = [];
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Helper functions for common security events
export const recordAuthFailure = (email: string, reason: string) => {
  securityMonitor.recordEvent('auth_failure', { email: email?.slice(0, 3) + '***', reason }, 'medium');
};

export const recordRateLimit = (identifier: string, endpoint?: string) => {
  securityMonitor.recordEvent('rate_limit', { identifier: identifier?.slice(0, 3) + '***', endpoint }, 'high');
};

export const recordApiError = (endpoint: string, status: number, error: string) => {
  securityMonitor.recordEvent('api_error', { endpoint, status, error: error?.slice(0, 100) }, 'medium');
};

export const recordSuspiciousRequest = (details: Record<string, any>) => {
  securityMonitor.recordEvent('suspicious_request', details, 'high');
};
