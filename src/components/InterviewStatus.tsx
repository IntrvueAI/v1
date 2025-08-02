import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

interface InterviewStatusProps {
  isConnected: boolean;
  isStreaming: boolean;
  sessionStatus: 'idle' | 'connecting' | 'connected' | 'streaming' | 'error';
  error?: string | null;
}

/**
 * Interview Status Component
 * Shows the current status of the interview session
 */
export const InterviewStatus: React.FC<InterviewStatusProps> = ({
  isConnected,
  isStreaming,
  sessionStatus,
  error
}) => {
  // Determine status color and icon based on current state
  const getStatusInfo = () => {
    if (error) {
      return {
        variant: 'destructive' as const,
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Connection Error',
        description: error
      };
    }

    switch (sessionStatus) {
      case 'connecting':
        return {
          variant: 'default' as const,
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          description: 'Establishing connection to interview system'
        };
      
      case 'connected':
        return {
          variant: 'secondary' as const,
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          description: 'Ready to start interview'
        };
      
      case 'streaming':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Interview Active',
          description: 'Interview session in progress'
        };
      
      default:
        return {
          variant: 'outline' as const,
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Disconnected',
          description: 'Click start to begin interview'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={statusInfo.variant} className="gap-2 px-3 py-1">
          {statusInfo.icon}
          {statusInfo.text}
        </Badge>
        
        {/* Connection Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Connected
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              Not Connected
            </>
          )}
        </div>
      </div>

      {/* Status Description */}
      {statusInfo.description && (
        <p className="text-sm text-muted-foreground">
          {statusInfo.description}
        </p>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Technical Status for Development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Debug Info</summary>
          <div className="mt-2 space-y-1 font-mono bg-muted p-2 rounded text-xs">
            <div>Connected: {isConnected.toString()}</div>
            <div>Streaming: {isStreaming.toString()}</div>
            <div>Status: {sessionStatus}</div>
            {error && <div>Error: {error}</div>}
          </div>
        </details>
      )}
    </div>
  );
};