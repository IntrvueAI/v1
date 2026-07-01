import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { Star, ChevronDown, FileText, MessageSquare } from 'lucide-react';

interface FeedbackShare {
  id: string;
  user_email: string | null;
  session_reference: string | null;
  interview_type: string | null;
  rating: number | null;
  comment: string | null;
  share_transcript: boolean;
  transcript: string | null;
  created_at: string;
}

/** Admin view of feedback students chose to share (comment, rating, and optionally their transcript). */
export const AdminUserFeedback: React.FC = () => {
  const [rows, setRows] = useState<FeedbackShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from('interview_feedback_shares')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) setError(error.message);
      else setRows((data ?? []) as unknown as FeedbackShare[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading feedback…</p>;
  if (error) return <p className="text-destructive">Failed to load feedback: {error}</p>;
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3" />
          No shared feedback yet.
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{r.user_email || 'Unknown user'}</CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {r.interview_type && <Badge variant="outline" className="text-xs">{r.interview_type}</Badge>}
                  {r.session_reference && (
                    <Badge variant="secondary" className="text-xs font-mono">{r.session_reference}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString('en-GB')}
                  </span>
                </div>
              </div>
              {r.rating != null && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {r.comment && <p className="text-sm">{r.comment}</p>}
            {r.share_transcript && r.transcript ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" /> View shared transcript <ChevronDown className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="mt-3 whitespace-pre-wrap text-xs bg-muted p-3 rounded-md max-h-96 overflow-auto">
                    {r.transcript}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <p className="text-xs text-muted-foreground">Transcript not shared.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
