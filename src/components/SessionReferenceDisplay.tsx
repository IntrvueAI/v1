import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionReferenceDisplayProps {
  sessionReference: string | null;
  onViewLogs?: () => void;
}

export const SessionReferenceDisplay: React.FC<SessionReferenceDisplayProps> = ({
  sessionReference,
  onViewLogs
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (sessionReference) {
      navigator.clipboard.writeText(sessionReference);
      toast({
        title: "Session Reference Copied",
        description: "You can share this with support if you need help.",
      });
    }
  };

  if (!sessionReference) return null;

  return (
    <Card className="p-4 bg-muted/50">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Session Reference
          </h3>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-sm font-mono border">
              {sessionReference}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Share this reference with support if you experience any issues during your interview.
          This helps us quickly identify and resolve technical problems.
        </p>

        {onViewLogs && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewLogs}
            className="gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            View Session Details
          </Button>
        )}
      </div>
    </Card>
  );
};