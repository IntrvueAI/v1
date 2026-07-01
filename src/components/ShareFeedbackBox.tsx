import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Send, Check } from 'lucide-react';

interface ShareFeedbackBoxProps {
  sessionReference: string | null;
  interviewType: string;
  /** The interview transcript, shared only if the user opts in. */
  transcript?: string;
}

/**
 * Shown at the bottom of the post-interview feedback. The student can leave a comment (and a star
 * rating), and optionally share their transcript with the intrvue team. Writes to
 * interview_feedback_shares, which the admin dashboard's Feedback tab reads.
 */
export const ShareFeedbackBox: React.FC<ShareFeedbackBoxProps> = ({ sessionReference, interviewType, transcript }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [shareTranscript, setShareTranscript] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!comment.trim() && rating === 0) {
      toast({ title: 'Add a comment or a rating first', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from('interview_feedback_shares').insert({
        user_id: user.id,
        user_email: user.email,
        session_reference: sessionReference,
        interview_type: interviewType,
        rating: rating || null,
        comment: comment.trim() || null,
        share_transcript: shareTranscript,
        transcript: shareTranscript ? transcript ?? null : null,
      });
      if (error) throw error;
      setDone(true);
      toast({ title: 'Thanks for sharing!', description: 'Your feedback helps us improve intrvue.' });
    } catch (err) {
      console.error('Failed to share feedback:', err);
      toast({ title: 'Could not send feedback', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-medium">Thanks for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Share your feedback</CardTitle>
        <CardDescription>Tell us how that went — it helps us make intrvue better. (Optional)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-1">
              <Star className={`w-6 h-6 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think? Anything confusing, too easy/hard, or that you loved?"
          rows={3}
          className="w-full rounded-md border border-input bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={shareTranscript}
            onChange={(e) => setShareTranscript(e.target.checked)}
            className="mt-0.5 h-4 w-4"
            disabled={!transcript}
          />
          <span className={!transcript ? 'text-muted-foreground' : ''}>
            Also share my interview transcript with the intrvue team{' '}
            <span className="text-muted-foreground">(helps us diagnose issues; only shared if you tick this)</span>
          </span>
        </label>

        <Button onClick={submit} disabled={submitting} className="gap-2">
          <Send className="w-4 h-4" />
          {submitting ? 'Sending…' : 'Share feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};
