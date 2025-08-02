import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Square, Loader2 } from 'lucide-react';

interface InterviewControlsProps {
  isStreaming: boolean;
  onStartInterview: () => Promise<void>;
  onStopInterview: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Interview Controls Component
 * Provides start/stop controls for the interview session
 */
export const InterviewControls: React.FC<InterviewControlsProps> = ({
  isStreaming,
  onStartInterview,
  onStopInterview,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle start interview with loading state
  const handleStart = async () => {
    setIsLoading(true);
    try {
      await onStartInterview();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop interview with loading state  
  const handleStop = async () => {
    setIsLoading(true);
    try {
      await onStopInterview();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-primary mb-4">Interview Controls</h3>
      
      <div className="space-y-4">
        {!isStreaming ? (
          <Button
            onClick={handleStart}
            disabled={disabled || isLoading}
            className="w-full interview-button-start gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Interview
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            disabled={isLoading}
            className="w-full interview-button-stop gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ending...
              </>
            ) : (
              <>
                <Square className="w-5 h-5" />
                End Interview
              </>
            )}
          </Button>
        )}

        {/* Interview Duration */}
        {isStreaming && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Interview in progress...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Take your time and speak naturally
            </p>
          </div>
        )}

        {/* Pre-interview Information */}
        {!isStreaming && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Click "Start Interview" when you're ready to begin
            </p>
            <p className="text-xs text-muted-foreground">
              The AI interviewer will introduce themselves and start with questions
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};